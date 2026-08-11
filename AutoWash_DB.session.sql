INSERT INTO public.customers (
    customer_id, full_name, phone, email, password, tier, 
    total_points, lifetime_points, total_visits, total_spend, is_active, registered_at
)
VALUES 
  (gen_random_uuid(), 'Alex Nguyen', '0901234567', 'alex.n@example.com', '$2a$10$X8A2M6fB8z7Gk9b3C2e1o.U9kZ5g6h7i8j9k1l2m3n4o5p6q7r8s9', 'GOLD', 2450, 2450, 18, 15200000.00, true, NOW()),
  (gen_random_uuid(), 'Trần Minh', '0918889999', 'minhtran@outlook.com', '$2a$10$X8A2M6fB8z7Gk9b3C2e1o.U9kZ5g6h7i8j9k1l2m3n4o5p6q7r8s9', 'PLATINUM', 8120, 8120, 42, 35000000.00, true, NOW()),
  (gen_random_uuid(), 'Lê Hồng', '0987654321', 'hongle.car@gmail.com', '$2a$10$X8A2M6fB8z7Gk9b3C2e1o.U9kZ5g6h7i8j9k1l2m3n4o5p6q7r8s9', 'MEMBER', 150, 150, 2, 200000.00, true, NOW());