document.addEventListener("DOMContentLoaded", function () {
  var product_links = document.querySelectorAll(".product-grid__link");
  var popup = document.getElementById("product-popup");
  var close_popup = document.querySelector(".close-popup");
  var add_to_cart = document.getElementById("popup-add-to-cart");
  var variants = [];

  product_links.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var product_handle = this.closest(".product-grid__item").dataset
        .productHandle;
      //console.log('/products/' + product_handle+ '.js');
      fetch("/products/" + product_handle + ".js")
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((product) => {
          console.log(product);
          document.getElementById("product-title").innerText = product.title;
          document.getElementById("product-price").innerHTML =
            product.price + "&euro;";
          document.getElementById("product-img").src = product.featured_image;
          //document.getElementById('selected-variant-id').innerText = product.variants[0].id;
          var tempDiv = document.createElement("div");
          tempDiv.innerHTML = product.description;
          document.getElementById("product-description").innerText =
            tempDiv.innerText;

          variants = product.variants;
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

          ul.childNodes.forEach(function (li) {
            li.addEventListener("click", function (e) {
              e.preventDefault();
              document
                .getElementById("product-colors")
                .childNodes.forEach((li) =>
                  li.classList.remove("selected-color")
                );
              this.classList.add("selected-color");
            });
          });

          // populating size variants
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

  close_popup.addEventListener("click", function () {
    popup.style.display = "none";
  });

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

  var obj = document.querySelector(".burger-menu-toggler");
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

  add_to_cart.addEventListener("click", function () {
    var selected_size = document.getElementById("product-sizes").value;
    var selected_color =
      document.getElementsByClassName("selected-color")[0].childNodes[1]
        .innerText;
    var selected = variants.find(
      (variant) =>
        variant.option1 == selected_size && variant.option2 == selected_color
    );
    console.log(selected);
    //if
    var variant_id = selected.id;
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
        //console.log(added_product);
        //var added_product = response.items.find(item => item.variant_id== variant_id);
        //console.log(added_product);
        if (
          added_product &&
          added_product.variant_options.includes("Black") &&
          added_product.variant_options.includes("M")
        ) {
          console.log("Soft Winter Jacket To be added here");
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
              //console.log(products);
              if (products) {
                const soft_winter_jacket = products.find(
                  (product) => product.title == "Soft Winter Jacket"
                );
                if (soft_winter_jacket) {
                  console.log(soft_winter_jacket);
                  const medium_black_variant = soft_winter_jacket.variants.find(
                    (med) => med.option1 == "M" && med.option2 == "Black"
                  );
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
