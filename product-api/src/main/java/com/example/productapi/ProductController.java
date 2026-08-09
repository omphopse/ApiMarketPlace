package com.example.productapi;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductController {
    private final List<Product> products = List.of(
            new Product(1, "Laptop", 55000),
            new Product(2, "Keyboard", 1500)
    );

    @GetMapping("/products")
    public List<Product> getProducts() {
        return products;
    }

    @GetMapping("/products/{id}")
    public Product getProduct(@PathVariable int id) {
        return products.stream()
                .filter(product -> product.id() == id)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    public record Product(int id, String name, int price) {
    }
}
