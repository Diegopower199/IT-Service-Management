package com.example.back_end.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back_end.dtos.department.DepartmentRequest;
import com.example.back_end.dtos.department.DepartmentResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.DepartmentModel;
import com.example.back_end.repository.DepartmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<DepartmentResponse> getAllDepartments() {

        List<DepartmentModel> departments = departmentRepository.findAllOrderedById();
        List<DepartmentResponse> result = new ArrayList<>();

        for (DepartmentModel department : departments) {
            result.add(convertToResponse(department));
        }

        return result;
    }

    public List<DepartmentResponse> getActiveDepartments() {

        List<DepartmentModel> departments = departmentRepository.findByActiveTrueOrderByIdDepartmentAsc();

        List<DepartmentResponse> result = new ArrayList<>();

        for (DepartmentModel department : departments) {
            result.add(convertToResponse(department));
        }

        return result;
    }

    public DepartmentResponse getDepartmentById(Long id) {

        DepartmentModel department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department with id " + id + " not found"));

        return convertToResponse(department);
    }

    public DepartmentResponse createDepartment(
            DepartmentRequest request) {

        if (departmentRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException(
                    "Department '" + request.getName() + "' already exists");
        }

        DepartmentModel department = new DepartmentModel();
        department.setName(request.getName());
        department.setActive(true);

        DepartmentModel savedDepartment = departmentRepository.save(department);

        return convertToResponse(savedDepartment);
    }

    public DepartmentResponse updateDepartment(
            Long id,
            DepartmentRequest request) {

        DepartmentModel department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department with id " + id + " not found"));

        if (!department.getName().equalsIgnoreCase(request.getName())
                && departmentRepository.existsByName(request.getName())) {

            throw new ResourceAlreadyExistsException(
                    "Department '" + request.getName() + "' already exists");
        }

        department.setName(request.getName());

        DepartmentModel updatedDepartment = departmentRepository.save(department);

        return convertToResponse(updatedDepartment);
    }

    public void deactivateDepartment(Long id) {

        DepartmentModel department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department with id " + id + " not found"));

        department.setActive(false);

        departmentRepository.save(department);
    }

    public void activateDepartment(Long id) {

        DepartmentModel department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department with id " + id + " not found"));

        department.setActive(true);

        departmentRepository.save(department);
    }

    private DepartmentResponse convertToResponse(
            DepartmentModel department) {

        return new DepartmentResponse(
                department.getIdDepartment(),
                department.getName(),
                department.isActive());
    }
}