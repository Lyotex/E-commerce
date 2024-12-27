// Get the hamburger icon and the navbar links
// document.getElementById('menu-icon').addEventListener('click', function() {
//   const navLinks = document.getElementById('nav-links');
//   navLinks.classList.toggle('active');
// });

// const products = [
//   { id: 1, title: "Smartphone", category: "Electronics", price: 299.99 },
//   { id: 2, title: "Laptop", category: "Electronics", price: 999.99 },
//   { id: 3, title: "T-shirt", category: "Fashion", price: 19.99 },
//   { id: 4, title: "Jeans", category: "Fashion", price: 49.99 },
//   { id: 5, title: "Blender", category: "Home & Garden", price: 29.99 },
//   { id: 6, title: "Lawn Mower", category: "Home & Garden", price: 199.99 },
//   { id: 7, title: "Soccer Ball", category: "Sports", price: 24.99 },
//   { id: 8, title: "Tennis Racket", category: "Sports", price: 89.99 },
//   { id: 9, title: "Action Figure", category: "Toys", price: 14.99 },
//   { id: 10, title: "Puzzle", category: "Toys", price: 9.99 },
//   // Add more products as needed
// ];

// function displayProducts(filteredProducts) {
//   const productsGrid = document.getElementById('products-grid');
//   productsGrid.innerHTML = ''; // Clear existing products
//   filteredProducts.forEach(product => {
//       const productCard = document.createElement('div');
//       productCard.className = 'product-card';
//       productCard.innerHTML = `
//           <img src="https://via.placeholder.com/150" alt="${product.title}">
//           <h2>${product.title}</h2>
//           <p>$${product.price.toFixed(2)}</p>
//           <div class="button-container">
//               <button class="add-to-cart">Add to Cart</button>
//               <button class="buy-now">Buy Now</button>
//           </div>
//       `;
//       productsGrid.appendChild(productCard);
//   });
// }

// function applyFilters() {
//   const checkboxes = document.querySelectorAll('.filter input[type="checkbox"]');
//   const selectedCategories = Array.from(checkboxes)
//       .filter(checkbox => checkbox.checked)
//       .map(checkbox => checkbox.nextSibling.textContent.trim());
  
//   const filteredProducts = products.filter(product => 
//       selectedCategories.length === 0 || selectedCategories.includes(product.category)
//   );
  
//   displayProducts(filteredProducts);
// }

// document.querySelector('.apply-filters').addEventListener('click', applyFilters);

// // Initial display of all products
// displayProducts(products);



// document.write('hello');
const left = document.querySelector ('.left');
const right = document.querySelector ('.right');
const slider = document.querySelector ('.slider');
const images = document.querySelectorAll('.image');

let slideNumber = 1

right.addEventListener('click',()=>{
  if (slideNumber < images.length){
    slider.style.transform = `translateX(-${slideNumber*600}px)`;
    slideNumber++;
  }
  else{
    slider.style.transform = `translateX(0px)`;
    slideNumber= 1;
  }
  

});

let currentCustomIndex = 0;
const totalCustomSlides = document.querySelectorAll('.custom-slide-item').length;

// Function to show the current slides based on the index
function showCustomSlides() {
    const customSlides = document.querySelector('.custom-slides-wrapper');
    const customDots = document.querySelectorAll('.custom-dot');
    customSlides.style.transform = `translateX(${-currentCustomIndex * 200}px)`; // Adjust based on box width

    customDots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentCustomIndex) {
            dot.classList.add('active');
        }
    });
}

// Function to move slides in a specified direction
function moveCustomSlide(direction) {
    currentCustomIndex = (currentCustomIndex + direction + totalCustomSlides) % totalCustomSlides;
    showCustomSlides();
}

// Function to set the current slide based on the dot clicked
function currentCustomSlide(index) {
    currentCustomIndex = index - 1; // Adjust for zero-based index
    showCustomSlides();
}

// Initialize the first slide
showCustomSlides();



// public/js/script.js
document.addEventListener('DOMContentLoaded', () => {
  const addToCartButton = document.getElementById('add-to-cart');
  const quantityInput = document.getElementById('quantity');

  if (addToCartButton) {
      addToCartButton.addEventListener('click', () => {
          const quantity = quantityInput.value;
          fetch('/add-to-cart', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ id: 'product1', quantity })
          })
          .then(response => response.json())
          .then(data => {
              console.log ('Cart updated:', data);
              alert('Item added to cart!');
          });
      });
  }

  const cartItemsList = document.getElementById('cart-items');

  if (cartItemsList) {
      fetch('/cart-items')
          .then(response => response.json())
          .then(cartItems => {
              cartItemsList.innerHTML = '';
              cartItems.forEach(item => {
                  const li = document.createElement('li');
                  li.textContent = `Product ID: ${item.id}, Quantity: ${item.quantity}`;
                  const removeButton = document.createElement('button');
                  removeButton.textContent = 'Remove';
                  removeButton.addEventListener('click', () => {
                      fetch('/remove-from-cart', {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ id: item.id })
                      })
                      .then(response => response.json())
                      .then(updatedCart => {
                          console.log('Cart updated:', updatedCart);
                          li.remove();
                      });
                  });
                  li.appendChild(removeButton);
                  cartItemsList.appendChild(li);
              });
          });
  }
});
document.addEventListener("DOMContentLoaded", function () {
    const categorySelect = document.getElementById("category");
    const priceInput = document.getElementById("price");
    const priceValue = document.getElementById("priceValue");
    const applyFiltersButton = document.querySelector("button");

    // Update the displayed price value when the range input changes
    priceInput.addEventListener("input", function () {
        priceValue.textContent = `$${this.value}`;
    });

    // Apply filters when the button is clicked
    applyFiltersButton.addEventListener("click", function () {
        const selectedCategory = categorySelect.value;
        const maxPrice = parseFloat(priceInput.value);
        const products = document.querySelectorAll(".product");

        products.forEach(product => {
            const priceText = product.querySelector(".price").textContent.replace('$', '');
            const price = parseFloat(priceText);

            // Check category and price conditions
            const isCategoryMatch = selectedCategory === "all" || product.querySelector("h2").textContent.toLowerCase().includes(selectedCategory);
            const isPriceMatch = price <= maxPrice;

            // Show or hide the product based on the filters
            if (isCategoryMatch && isPriceMatch) {
                product.style.display = "block";
            } else {
                product.style.display = "none";
            }
        });
    });
});