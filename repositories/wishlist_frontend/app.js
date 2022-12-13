BASE_API_URL = "http://localhost:3001/api";

//---------------------------  Login & Invi Popup -------------------------------------------
function openForm() {
    document.getElementById("login-form").style.display = "block";
}

function closeForm() {
    document.getElementById("login-form").style.display = "none";
}

function openInvitePanel() {
    document.getElementById("invite-form").style.display = "block";
}

async function sendInvite() {
    const invitedEmail = document.getElementById("inviteEmail").value;
    const inviteeEmail = localStorage.getItem("email").slice(1, -1);

    document.getElementById("invite-form").style.display = "block";
    const response = await fetch(`${BASE_API_URL}/invite`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            invitedEmail,
            inviteeEmail,
        }),
    });
    const res = await response.json();
    console.log(res);
}
function closeInvite() {
    document.getElementById("invite-form").style.display = "none";
}

async function submitLogin() {
    const response = await fetch(`${BASE_API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
        }),
    });
    const res = await response.json();
    //console.log(res);
    localStorage.setItem("jwt", JSON.stringify(res.jwt));
    localStorage.setItem("userId", JSON.stringify(res.userId));
    localStorage.setItem("email", JSON.stringify(res.email));
    closeForm();
    if (response.status === 200) {
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("logoutButton").style.display = "block";
        document.getElementById("nav_profile").style.display = "block";
        document.getElementById("inviteFriend-btn").style.display = "block";
    } else {
        alert("failed to login");
    }
}

async function logout() {
    const response = await fetch(`${BASE_API_URL}/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });
    console.log(await response.json());
    document.getElementById("logoutButton").style.display = "none";
    document.getElementById("loginButton").style.display = "block";
    document.getElementById("nav_profile").style.display = "none";
    document.getElementById("inviteFriend-btn").style.display = "none";
    localStorage.removeItem('jwt');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    console.log("clear cookie");
}

async function submitRegister() {
    const response = await fetch(`${BASE_API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: document.getElementById("registerName").value,
            email: document.getElementById("registerEmail").value,
            password: document.getElementById("registerPassword").value,
            picturePath: document.getElementById("registerImg").value,
        }),
    });
    const res = await response.json();
    console.log(res);
}

async function getWishlist() {
    const id = localStorage.getItem("userId").slice(1, -1);

    const response = await fetch(`${BASE_API_URL}/wishlist/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const res = await response.json();
    console.log(res);
    if (res.length !== 0) {
        const wishlistItemsDiv = document.getElementById("wishlistTable");

        const dataHtml = res
            .map((product) => {
                return `
            <tr class="table-id">
                <td>${product.id}</td>
                <td>${product.product_name}</td>
                <td>${product.price}</td>
                <td>
                    <a href=${product.link}</a> 
                    ${product.link}
                </td>
            </tr>
          `;
            })
            .join("");
        wishlistItemsDiv.insertAdjacentHTML("beforeend", dataHtml);

        return res;
    }
}

document.addEventListener("mouseup", function (e) {
    var container = document.getElementById("login-form");
    if (!container.contains(e.target)) {
        container.style.display = "none";
    }
});
document.addEventListener("mouseup", function (e) {
    var container = document.getElementById("invite-form");
    if (!container.contains(e.target)) {
        container.style.display = "none";
    }
});

//---------------------------  Fetch data from api -------------------------------------------
async function getAllProducts() {
    const response = await fetch(
        "https://si-graphql.azurewebsites.net/graphql",
        {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                query: `query Product { 
                    products { 
                        id 
                        product_name 
                        price 
                        main_category 
                        product_description  
                        product_image { 
                            image_url 
                        } 
                    } 
                }`,
                variables: {},
                operationName: "Product",
            }),
        }
    );
    const res = await response.json();
    const data = res.data.products;
    const listingTable = document.querySelector("#listingTable");
    if (data !== null) {
        const dataHtml = data
            .map((product) => {
                return `
            <tr class="table-id" 
              onClick="
              document.location.href='productDetail.html';
              storeLocal(
                '${product.id}', 
                '${product.product_name}', 
                '${product.price}', 
                '${product.main_category}', 
                '${product.product_description}', 
                '${product.product_image.image_url}')
            ">
                <td>${product.id}</td>
                <td>${product.product_name}</td>
                <td>${product.price}</td>
                <td>${product.main_category}</td>
            </tr>
          `;
            })
            .join("");
        listingTable.insertAdjacentHTML("beforeend", dataHtml);
    }
}

async function searchGraphQL() {
    const searchTerm = document.getElementById("search").value;
    console.log(searchTerm);
    const response = await fetch(
        "https://si-graphql.azurewebsites.net/graphql",
        {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                query: `query GetProductsBySearchTerm($term: String!) {
                    getProductsBySearchTerm(term: $term) { 
                    product_name 
                    id 
                    product_sub_title 
                    product_description 
                    main_category sub_category 
                    price 
                    link 
                    overall_rating 
                    product_image { 
                        product_id 
                        image_url 
                        alt_text 
                        additional_info
                    } 
                    product_info { 
                        product_id 
                        choices 
                        additional_info}
                    }
                }`,
                variables: {
                    term: searchTerm,
                },
                operationName: "GetProductsBySearchTerm",
            }),
        }
    );
    const res = await response.json();
    console.log(res);
    console.log(res.data.getProductsBySearchTerm);
}

//---------------------------  Search function -------------------------------------------

function mySearchFunction() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("listingTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

const storeLocal = (
    productId,
    productName,
    productPrice,
    productMainCat,
    productDescription,
    productImg
) => {
    localStorage.setItem("productId", JSON.stringify(productId));
    localStorage.setItem("productName", JSON.stringify(productName));
    localStorage.setItem("productPrice", JSON.stringify(productPrice));
    localStorage.setItem("productMainCat", JSON.stringify(productMainCat));
    localStorage.setItem(
        "productDescription",
        JSON.stringify(productDescription)
    );
    localStorage.setItem("productImg", JSON.stringify(productImg));
};
