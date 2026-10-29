package com.example.back_end.specification;

import org.springframework.data.jpa.domain.Specification;

import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;

/**
 * Provides reusable specifications for filtering tickets.
 *
 * <p>
 * Specifications allow ticket filters to be combined dynamically depending
 * on the parameters provided by the client.
 * </p>
 */
public final class TicketSpecification {

    /**
     * Prevents instantiation of this utility class.
     */
    private TicketSpecification() {
    }

    /**
     * Creates a specification that filters tickets created by or requested for
     * the provided user.
     *
     * @param user user who created the ticket or for whom the ticket was
     *             requested
     * @return specification used to filter tickets by user
     */
    public static Specification<TicketModel> createdByOrRequestedFor(
            UserModel user) {

        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.equal(
                        root.get("createdBy"),
                        user),
                criteriaBuilder.equal(
                        root.get("requestedFor"),
                        user));
    }

    /**
     * Creates a specification that filters tickets whose title contains the
     * provided text.
     *
     * <p>
     * The comparison is case-insensitive. If no title is provided, no title
     * restriction is applied.
     * </p>
     *
     * @param title text to search for in the ticket title
     * @return specification used to filter tickets by title
     */
    public static Specification<TicketModel> titleContains(String title) {
        return (root, query, criteriaBuilder) -> {
            if (title == null || title.isBlank()) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")),
                    "%" + title.toLowerCase() + "%");
        };
    }

    /**
     * Creates a specification that filters tickets by status.
     *
     * <p>
     * If no status is provided, no status restriction is applied.
     * </p>
     *
     * @param status status name used to filter tickets
     * @return specification used to filter tickets by status
     */
    public static Specification<TicketModel> statusIs(String status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null || status.isBlank()) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(
                    root.get("status").get("name"),
                    status);
        };
    }

    /**
     * Creates a specification that filters tickets by priority.
     *
     * <p>
     * If no priority is provided, no priority restriction is applied.
     * </p>
     *
     * @param priority priority name used to filter tickets
     * @return specification used to filter tickets by priority
     */
    public static Specification<TicketModel> priorityIs(String priority) {
        return (root, query, criteriaBuilder) -> {
            if (priority == null || priority.isBlank()) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(
                    root.get("priority").get("name"),
                    priority);
        };
    }

    /**
     * Creates a specification that filters tickets by category.
     *
     * <p>
     * If no category is provided, no category restriction is applied.
     * </p>
     *
     * @param category category name used to filter tickets
     * @return specification used to filter tickets by category
     */
    public static Specification<TicketModel> categoryIs(String category) {
        return (root, query, criteriaBuilder) -> {
            if (category == null || category.isBlank()) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(
                    root.get("category").get("name"),
                    category);
        };
    }
}