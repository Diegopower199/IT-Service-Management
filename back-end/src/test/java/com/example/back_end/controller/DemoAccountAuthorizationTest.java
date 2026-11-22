package com.example.back_end.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Base64;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.method.AuthorizationManagerBeforeMethodInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.example.back_end.enums.GridFsBucketType;
import com.example.back_end.exception.GlobalExceptionHandler;
import com.example.back_end.model.DepartmentModel;
import com.example.back_end.model.RoleModel;
import com.example.back_end.model.UserAvatarModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.DepartmentRepository;
import com.example.back_end.repository.RoleRepository;
import com.example.back_end.repository.UserAvatarRepository;
import com.example.back_end.repository.UserRepository;
import com.example.back_end.service.MongoFileStorageService;
import com.example.back_end.service.UserAvatarService;
import com.example.back_end.service.UserService;

class DemoAccountAuthorizationTest {

    private static final String PROFILE = """
            {"email":"updated@example.test","firstName":"Updated","lastName":"Account"}
            """;
    private static final String PASSWORD = """
            {"currentPassword":"old-password","newPassword":"new-password"}
            """;

    private final UserRepository users = mock(UserRepository.class);
    private final RoleRepository roles = mock(RoleRepository.class);
    private final DepartmentRepository departments = mock(DepartmentRepository.class);
    private final PasswordEncoder passwords = mock(PasswordEncoder.class);
    private final UserAvatarRepository avatars = mock(UserAvatarRepository.class);
    private final MongoFileStorageService storage = mock(MongoFileStorageService.class);
    private final RoleModel administrator = new RoleModel(11L, "ADMIN");
    private final RoleModel technician = new RoleModel(22L, "TECHNICIAN");
    private final RoleModel regularUser = new RoleModel(33L, "USER");
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        UserService userService = new UserService(users, roles, departments, passwords);
        ProxyFactory userController = new ProxyFactory(new UserController(userService));
        userController.addAdvisor(AuthorizationManagerBeforeMethodInterceptor.preAuthorize());
        mvc = MockMvcBuilders.standaloneSetup(userController.getProxy(),
                new UserAvatarController(new UserAvatarService(avatars, users, storage)))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @ParameterizedTest
    @CsvSource({"admin, ADMIN", "admin_demo, ADMIN", "technician_demo, TECHNICIAN", "user_demo, USER"})
    void demoAdminCanReadProtectedAccountsButCannotUpdateThem(String username, String roleName) throws Exception {
        Authentication admin = signIn("admin_demo", "ADMIN");
        when(users.findById(501L)).thenReturn(Optional.of(account(username, new RoleModel(99L, roleName))));

        mvc.perform(get("/users/501").principal(admin)).andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username));
        forbidden(put("/users/501").principal(admin).contentType(MediaType.APPLICATION_JSON)
                .content(userData("renamed-account", 33L, false, false)));

        verify(users, never()).save(any());
    }

    @Test
    void demoAdminCanCreateAndManageARegularUser() throws Exception {
        Authentication admin = signIn("admin_demo", "ADMIN");
        allowUserWrites();

        mvc.perform(post("/users").principal(admin).contentType(MediaType.APPLICATION_JSON)
                .content(userData("employee", 33L, true, true)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.role.name").value("USER"));

        when(users.findById(501L)).thenReturn(Optional.of(account("employee", regularUser)));
        mvc.perform(put("/users/501").principal(admin).contentType(MediaType.APPLICATION_JSON)
                .content(userData("employee", 22L, false, false)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.role.name").value("TECHNICIAN"))
                .andExpect(jsonPath("$.enabled").value(false));
    }

    @Test
    void demoAdminCannotGrantAdminRoleThroughCreationOrUpdate() throws Exception {
        Authentication admin = signIn("admin_demo", "ADMIN");
        allowUserWrites();
        when(users.findById(501L)).thenReturn(Optional.of(account("employee", regularUser)));

        forbidden(post("/users").principal(admin).contentType(MediaType.APPLICATION_JSON)
                .content(userData("new-account", 11L, true, true)));
        forbidden(put("/users/501").principal(admin).contentType(MediaType.APPLICATION_JSON)
                .content(userData("employee", 11L, true, false)));

        verify(users, never()).save(any());
    }

    @Test
    void privateAdminCanGrantAdminRoleAndEditProtectedAccounts() throws Exception {
        Authentication admin = signIn("admin", "ADMIN");
        allowUserWrites();
        when(users.findById(501L)).thenReturn(Optional.of(account("user_demo", regularUser)));

        mvc.perform(post("/users").principal(admin).contentType(MediaType.APPLICATION_JSON)
                .content(userData("private-admin", 11L, true, true)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.role.name").value("ADMIN"));
        mvc.perform(put("/users/501").principal(admin).contentType(MediaType.APPLICATION_JSON)
                .content(userData("user_demo", 33L, false, false)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.enabled").value(false));
    }

    @ParameterizedTest
    @CsvSource({"admin_demo, ADMIN", "technician_demo, TECHNICIAN", "user_demo, USER"})
    void demoAccountsCanReadTheirProfileButCannotEditDetailsChangePasswordOrDeleteAvatar(String username,
            String roleName) throws Exception {
        Authentication demo = signIn(username, roleName);
        when(users.findByUsername(username)).thenReturn(Optional.of(account(username, new RoleModel(99L, roleName))));

        mvc.perform(get("/users/me").principal(demo)).andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username));
        forbidden(put("/users/me").principal(demo).contentType(MediaType.APPLICATION_JSON).content(PROFILE));
        forbidden(put("/users/change-password").principal(demo).contentType(MediaType.APPLICATION_JSON).content(PASSWORD));
        forbidden(delete("/users/me/avatar").principal(demo));

        verify(users, never()).save(any());
        verifyNoInteractions(passwords, avatars, storage);
    }

    @ParameterizedTest
    @CsvSource({"admin, ADMIN", "admin_demo, ADMIN", "technician_demo, TECHNICIAN", "user_demo, USER"})
    void accountsCanUploadTheirOwnAvatar(String username, String roleName) throws Exception {
        Authentication actor = signIn(username, roleName);
        when(users.findByUsername(username)).thenReturn(Optional.of(account(username, new RoleModel(99L, roleName))));
        when(storage.saveFile(eq(GridFsBucketType.USER_AVATARS), any(), eq("photo.png"), eq("image/png")))
                .thenReturn("avatar-id");
        when(avatars.saveAndFlush(any(UserAvatarModel.class))).thenAnswer(call -> call.getArgument(0));
        byte[] png = Base64.getDecoder().decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X6FYAAAAASUVORK5CYII=");

        TransactionSynchronizationManager.initSynchronization();
        try {
            mvc.perform(multipart(HttpMethod.PUT, "/users/me/avatar")
                    .file(new MockMultipartFile("file", "photo.png", "image/png", png)).principal(actor))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.userId").value(501))
                    .andExpect(jsonPath("$.fileName").value("photo.png"))
                    .andExpect(jsonPath("$.contentType").value("image/png"));
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @ParameterizedTest
    @CsvSource({"admin, ADMIN", "regular-technician, TECHNICIAN", "regular-user, USER"})
    void regularAccountsCanEditTheirProfileAndPassword(String username, String roleName) throws Exception {
        Authentication actor = signIn(username, roleName);
        UserModel account = account(username, new RoleModel(99L, roleName));
        account.setPassword("existing-hash");
        when(users.findByUsername(username)).thenReturn(Optional.of(account));
        when(users.save(any(UserModel.class))).thenAnswer(call -> call.getArgument(0));
        when(passwords.matches("old-password", "existing-hash")).thenReturn(true);
        when(passwords.encode("new-password")).thenReturn("updated-hash");

        mvc.perform(put("/users/me").principal(actor).contentType(MediaType.APPLICATION_JSON).content(PROFILE))
                .andExpect(status().isOk()).andExpect(jsonPath("$.firstName").value("Updated"));
        mvc.perform(put("/users/change-password").principal(actor).contentType(MediaType.APPLICATION_JSON).content(PASSWORD))
                .andExpect(status().isNoContent());
        verify(passwords).encode("new-password");
    }

    private void forbidden(RequestBuilder request) throws Exception {
        mvc.perform(request).andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    private void allowUserWrites() {
        when(roles.findById(11L)).thenReturn(Optional.of(administrator));
        when(roles.findById(22L)).thenReturn(Optional.of(technician));
        when(roles.findById(33L)).thenReturn(Optional.of(regularUser));
        DepartmentModel department = new DepartmentModel();
        department.setIdDepartment(44L);
        department.setName("IT");
        when(departments.findById(44L)).thenReturn(Optional.of(department));
        when(users.save(any(UserModel.class))).thenAnswer(call -> call.getArgument(0));
    }

    private static Authentication signIn(String username, String roleName) {
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(username, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + roleName)));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return authentication;
    }

    private static UserModel account(String username, RoleModel role) {
        UserModel account = new UserModel();
        account.setIdUser(501L);
        account.setUsername(username);
        account.setEmail(username + "@example.test");
        account.setRole(role);
        account.setEnabled(true);
        return account;
    }

    private static String userData(String username, Long roleId, boolean enabled, boolean creating) {
        return """
                {"username":"%s","email":"employee@example.test","firstName":"Demo","lastName":"Fixture",
                "roleId":%d,"departmentId":44,"enabled":%b%s}
                """.formatted(username, roleId, enabled, creating ? ",\"password\":\"test-password\"" : "");
    }
}
