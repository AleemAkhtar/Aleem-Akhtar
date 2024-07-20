/// SCRIPT FILE
/// Implements functions for various options i.e. menu open-close, pop-up open close

// Add Event Listener for DOM Content Loaded
document.addEventListener("DOMContentLoaded", function () {
  // select all products divs, popup, close popup button, and add to card button
  var product_links = document.querySelectorAll(".product-grid__link");
  var popup = document.getElementById("product-popup");
  var close_popup = document.querySelector(".close-popup");
  var add_to_cart = document.getElementById("popup-add-to-cart");
  var variants = [];

  // For each element of product_links, add an onclick listener
  product_links.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var product_handle = this.closest(".product-grid__item").dataset
        .productHandle;
      // fetch product for matching product
      fetch("/products/" + product_handle + ".js")
        .then((response) => {
          if (response.ok) {
            // return response in JSON for fetched product
            return response.json();
          }
        })
        .then((product) => {
          //console.log(product);
          // Set popup details based on fetched product
          document.getElementById("product-title").innerText = product.title;
          document.getElementById("product-price").innerHTML =
            product.price + "&euro;";
          document.getElementById("product-img").src = product.featured_image;
          var tempDiv = document.createElement("div");
          tempDiv.innerHTML = product.description;
          document.getElementById("product-description").innerText =
            tempDiv.innerText;

          variants = product.variants;  // save all product variants

          // populating color variants
          var colors = product.options[1].values;
          var ul = document.getElementById("product-colors");
          ul.innerHTML = "";
          colors.forEach(function (color) {
            var li =
              '<li><span style="background-color: ' + color + ';"></span>';
            li += "<button>" + color + "</button></li>";
            ul.innerHTML += li;
          });
          // add click event for each of color added
          ul.childNodes.forEach(function (li) {
            li.addEventListener("click", function (e) {
              e.preventDefault();
              // remove selected-color class from all child nodes
              document
                .getElementById("product-colors")
                .childNodes.forEach((li) =>
                  li.classList.remove("selected-color")
                );
              this.classList.add("selected-color");
            });
          });

          // populating size variants, similar to colors
          var sizes = product.options[0].values;
          var options = document.getElementById("product-sizes");
          options.innerHTML = "";
          sizes.forEach(function (size) {
            var li = '<option value="' + size + '">' + size + "</option>";
            options.innerHTML += li;
          });
          popup.style.display = "block";
        });
    });
  });

  // add click event to close the popup
  close_popup.addEventListener("click", function () {
    popup.style.display = "none";
  });

  // different listeners to have arrow-up and arrow-down icons when sizes are open
  var options = document.getElementById("product-sizes");
  options.addEventListener("mousedown", function () {
    options.classList.add("product-variant-item-open");
  });
  options.addEventListener("change", function () {
    options.classList.remove("product-variant-item-open");
  });
  options.addEventListener("blur", function () {
    options.classList.remove("product-variant-item-open");
  });

  // Add event listeners to implement burger menu effect i.e. burger and cross icons
  document
    .getElementById("mobile-menu-open")
    .addEventListener("click", function (e) {
      document.querySelector(".burger-menu").style.display = "block";
      document.getElementById("mobile-menu-close").classList.remove("d-none");
      document
        .getElementById("top-banner-menu-toggler")
        .classList.add("top-banner-menu-open");
      this.classList.add("d-none");
    });
  document
    .getElementById("mobile-menu-close")
    .addEventListener("click", function (e) {
      document.getElementById("mobile-menu-open").classList.remove("d-none");
      this.classList.add("d-none");
      document.querySelector(".burger-menu").style.display = "none";
      document
        .getElementById("top-banner-menu-toggler")
        .classList.remove("top-banner-menu-open");
    });

  // Implement event listeners for add to card button
  add_to_cart.addEventListener("click", function () {
    // get both selected size and color
    var selected_size = document.getElementById("product-sizes").value;
    var selected_color =
      document.getElementsByClassName("selected-color")[0].childNodes[1]
        .innerText;
    // find matching product based on selected size and color
    var selected = variants.find(
      (variant) =>
        variant.option1 == selected_size && variant.option2 == selected_color
    );
    //console.log(selected);
    var variant_id = selected.id;   // set id of selected product variation as variant id
    // call add.js with POST method to add product to cart
    fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ id: variant_id, quantity: 1 }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((added_product) => {
        // Get added product in cart
        // if added product was Medium-Black variant, then add soft winter jacket
        if (
          added_product &&
          added_product.variant_options.includes("Black") &&
          added_product.variant_options.includes("M")
        ) {
          // fetch all products
          fetch("/products.json")
            .then((response) => {
              if (response.ok) {
                return response.json();
              } else {
                console.log("some error occurred.");
              }
            })
            .then((response) => {
              const products = response.products;
              // find product with soft winter jacket in title
              if (products) {
                const soft_winter_jacket = products.find(
                  (product) => product.title.toLowerCase() == "Soft Winter Jacket".toLowerCase()
                );
                // if soft winter jacket is found, get its Medium-Black variant
                if (soft_winter_jacket) {
                  const medium_black_variant = soft_winter_jacket.variants.find(
                    (med) => med.option1 == "M" && med.option2 == "Black"
                  );
                  // if medium-black variant exists, then add to cart as well
                  if (medium_black_variant) {
                    fetch("/cart/add.js", {
                      method: "POST",
                      headers: {
                        "Content-type": "application/json",
                      },
                      body: JSON.stringify({
                        id: medium_black_variant.id,
                        quantity: 1,
                      }),
                    }).then((response) => {
                      if (response.ok) {
                        // Display a confirmation message on console.
                        console.log("Soft Winter Jacket Added.");
                      }
                    });
                  }
                } else {
                  console.log("not found");
                }
              }
            });
        }
        popup.style.display = "none";
      });
  });
});
