import {
  GridContainer,
  LeftColumn,
  SelectorContainer,
  ProductSelector,
  RightColumn,
  ManualToggle,
  ManualOverlay,
  ManualColumn,
  Header,
  CartItem,
  AddButton,
  StockInfoText,
  CartItemBox,
  ProductOption,
} from "./components";
import { prodList } from "./data";
import {
  PRODUCT_ONE,
  PRODUCT_TWO,
  PRODUCT_THREE,
  // PRODUCT_FOUR,
  // PRODUCT_FIVE,
  DISCOUNT_RATE,
} from "./constants";

let totalItemCount = 0;
let lastSel = null;
let totalDiscountedPrice = 0;
let sum;
let productSelector = ProductSelector();
let addBtn = AddButton();
let stockInfo = StockInfoText();
let cartItemBox = CartItemBox();

const main = () => {
  let root = document.getElementById("app");
  let header = Header();
  let gridContainer = GridContainer();
  let leftColumn = LeftColumn();
  let selectorContainer = SelectorContainer();
  let rightColumn = RightColumn();
  let manualToggle = ManualToggle();
  let manualOverlay = ManualOverlay();
  let manualColumn = ManualColumn();
  let randomBaseDelay = Math.random() * 10000;

  selectorContainer.appendChild(productSelector);
  selectorContainer.appendChild(addBtn);
  selectorContainer.appendChild(stockInfo);
  leftColumn.appendChild(selectorContainer);
  leftColumn.appendChild(cartItemBox);
  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualToggle);
  root.appendChild(manualOverlay);

  sum = rightColumn.querySelector("#cart-total");
  manualToggle.onclick = () => {
    manualOverlay.classList.toggle("hidden");
    manualColumn.classList.toggle("translate-x-full");
  };
  manualOverlay.onclick = (e) => {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add("hidden");
      manualColumn.classList.add("translate-x-full");
    }
  };
  onUpdateSelectOptions();
  handleCalculateCartStuff();
  setTimeout(() => {
    setInterval(() => {
      const luckyIdx = Math.floor(Math.random() * prodList.length);
      const luckyItem = prodList[luckyIdx];

      if (luckyItem.quantity > 0 && !luckyItem.onSale) {
        luckyItem.price = Math.round((luckyItem.originalPrice * 80) / 100);
        luckyItem.onSale = true;
        alert(`⚡번개세일! ${luckyItem.name}이(가) 20% 할인 중입니다!`);
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, 30000);
  }, randomBaseDelay);
  setTimeout(() => {
    setInterval(() => {
      if (lastSel) {
        let suggest = prodList.find(
          (item) =>
            item.id !== lastSel && item.quantity > 0 && !item.suggestSale
        );
        if (suggest) {
          alert(
            `💝 ${suggest.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`
          );
          suggest.val = Math.round((suggest.val * (100 - 5)) / 100);
          suggest.suggestSale = true;
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }
    }, 60000);
  }, randomBaseDelay * 2);
};

const onUpdateSelectOptions = () => {
  productSelector.innerHTML = "";
  productSelector.append(...prodList.map(ProductOption));

  const totalStock = prodList.reduce((acc, item) => acc + item.quantity, 0);
  productSelector.style.borderColor = totalStock < 50 ? "orange" : "";
};

const handleCalculateCartStuff = () => {
  totalDiscountedPrice = 0;
  totalItemCount = 0;

  let totalOriginalPrice = 0;
  let itemDiscounts = [];

  const cartItems = cartItemBox.children;
  for (let i = 0; i < cartItems.length; i++) {
    const cartItem = prodList.find((item) => item.id === cartItems[i].id);
    const itemQuantity = Number(
      cartItems[i].querySelector(".quantity-number").textContent
    );
    const itemPrice = cartItem.price * itemQuantity;

    totalItemCount += itemQuantity;
    totalOriginalPrice += itemPrice;

    const priceTexts = cartItems[i].querySelectorAll(".text-lg, .text-xs");
    priceTexts.forEach((text) => {
      if (text.classList.contains("text-lg")) {
        text.style.fontWeight = itemQuantity >= 10 ? "bold" : "normal";
      }
    });

    let discountRate = 0;
    if (itemQuantity >= 10) {
      discountRate = DISCOUNT_RATE[cartItem.id] || 0;

      if (discountRate > 0) {
        itemDiscounts.push({
          name: cartItem.name,
          discount: discountRate * 100,
        });
      }
    }
    totalDiscountedPrice += itemPrice * (1 - discountRate);
  }

  let discRate = 0;
  if (totalItemCount >= 30) {
    totalDiscountedPrice = (totalOriginalPrice * 75) / 100;
    discRate = 25 / 100;
  } else {
    discRate = (totalOriginalPrice - totalDiscountedPrice) / totalOriginalPrice;
  }

  const today = new Date();
  const isTuesday = today.getDay() === 2;
  const tuesdaySpecial = document.getElementById("tuesday-special");
  if (isTuesday) {
    if (totalDiscountedPrice > 0) {
      totalDiscountedPrice = (totalDiscountedPrice * 90) / 100;
      discRate = 1 - totalDiscountedPrice / totalOriginalPrice;
      tuesdaySpecial.classList.remove("hidden");
    } else {
      tuesdaySpecial.classList.add("hidden");
    }
  } else {
    tuesdaySpecial.classList.add("hidden");
  }

  document.getElementById("item-count").textContent =
    `🛍️ ${totalItemCount} items in cart`;

  let summaryDetails = document.getElementById("summary-details");
  summaryDetails.innerHTML = "";
  if (totalOriginalPrice > 0) {
    for (let i = 0; i < cartItems.length; i++) {
      let curItem = null;
      for (let j = 0; j < prodList.length; j++) {
        if (prodList[j].id === cartItems[i].id) {
          curItem = prodList[j];
          break;
        }
      }
      const qtyElem = cartItems[i].querySelector(".quantity-number");
      const q = parseInt(qtyElem.textContent);
      const itemTotal = curItem.price * q;
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${curItem.name} x ${q}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
    }
    summaryDetails.innerHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${totalOriginalPrice.toLocaleString()}</span>
      </div>
    `;
    if (totalItemCount >= 30) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span class="text-xs">-25%</span>
        </div>
      `;
    } else if (itemDiscounts.length > 0) {
      itemDiscounts.forEach((item) => {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${item.name} (10개↑)</span>
            <span class="text-xs">-${item.discount}%</span>
          </div>
        `;
      });
    }
    if (isTuesday) {
      if (totalDiscountedPrice > 0) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-purple-400">
            <span class="text-xs">🌟 화요일 추가 할인</span>
            <span class="text-xs">-10%</span>
          </div>
        `;
      }
    }
    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }

  let totalDiv = sum.querySelector(".text-2xl");
  if (totalDiv) {
    totalDiv.textContent =
      "₩" + Math.round(totalDiscountedPrice).toLocaleString();
  }

  let loyaltyPointsDiv = document.getElementById("loyalty-points");
  if (loyaltyPointsDiv) {
    let points = Math.floor(totalDiscountedPrice / 1000);
    if (points > 0) {
      loyaltyPointsDiv.textContent = `적립 포인트: ${points}p`;
      loyaltyPointsDiv.style.display = "block";
    } else {
      loyaltyPointsDiv.textContent = "적립 포인트: 0p";
      loyaltyPointsDiv.style.display = "block";
    }
  }

  let discountInfoDiv = document.getElementById("discount-info");
  discountInfoDiv.innerHTML = "";
  if (discRate > 0 && totalDiscountedPrice > 0) {
    let savedAmount = totalOriginalPrice - totalDiscountedPrice;
    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(discRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
  }

  let itemCountElement = document.getElementById("item-count");
  if (itemCountElement) {
    let previousCount = parseInt(
      itemCountElement.textContent.match(/\d+/) || 0
    );
    itemCountElement.textContent = `🛍️ ${totalItemCount} items in cart`;
    if (previousCount !== totalItemCount) {
      itemCountElement.setAttribute("data-changed", "true");
    }
  }

  let stockMsg = "";
  for (let stockIdx = 0; stockIdx < prodList.length; stockIdx++) {
    const item = prodList[stockIdx];
    if (item.quantity < 5) {
      if (item.quantity > 0) {
        stockMsg = `${stockMsg} ${item.name}: 재고 부족 (${item.quantity}개 남음)\n`;
      } else {
        stockMsg = `${stockMsg} ${item.name}: 품절\n`;
      }
    }
  }
  stockInfo.textContent = stockMsg;
  handleStockInfoUpdate();
  doRenderBonusPoints();
};

const doRenderBonusPoints = () => {
  let basePoints = Math.floor(totalDiscountedPrice / 1000);
  let finalPoints = 0;
  let pointsDetail = [];
  let hasKeyboard = false;
  let hasMouse = false;
  let hasMonitorArm = false;
  let nodes = cartItemBox.children;
  if (nodes.length === 0) {
    document.getElementById("loyalty-points").style.display = "none";
    return;
  }
  if (basePoints > 0) {
    finalPoints = basePoints;
    pointsDetail.push(`기본: ${basePoints}p`);
  }
  if (new Date().getDay() === 2) {
    if (basePoints > 0) {
      finalPoints = basePoints * 2;
      pointsDetail.push("화요일 2배");
    }
  }
  for (const node of nodes) {
    let product = null;
    for (let pIdx = 0; pIdx < prodList.length; pIdx++) {
      if (prodList[pIdx].id === node.id) {
        product = prodList[pIdx];
        break;
      }
    }
    if (!product) continue;
    if (product.id === PRODUCT_ONE) {
      hasKeyboard = true;
    } else if (product.id === PRODUCT_TWO) {
      hasMouse = true;
    } else if (product.id === PRODUCT_THREE) {
      hasMonitorArm = true;
    }
  }
  if (hasKeyboard && hasMouse) {
    finalPoints = finalPoints + 50;
    pointsDetail.push("키보드+마우스 세트 +50p");
  }
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints = finalPoints + 100;
    pointsDetail.push("풀세트 구매 +100p");
  }
  if (totalItemCount >= 30) {
    finalPoints = finalPoints + 100;
    pointsDetail.push("대량구매(30개+) +100p");
  } else {
    if (totalItemCount >= 20) {
      finalPoints = finalPoints + 50;
      pointsDetail.push("대량구매(20개+) +50p");
    } else {
      if (totalItemCount >= 10) {
        finalPoints = finalPoints + 20;
        pointsDetail.push("대량구매(10개+) +20p");
      }
    }
  }
  let bonusPts = finalPoints;
  const ptsTag = document.getElementById("loyalty-points");
  if (ptsTag) {
    if (bonusPts > 0) {
      ptsTag.innerHTML = `
        <div>적립 포인트: <span class="font-bold">${bonusPts}p</span></div>
        <div class="text-2xs opacity-70 mt-1">${pointsDetail.join(", ")}</div>
      `;
      ptsTag.style.display = "block";
    } else {
      ptsTag.textContent = "적립 포인트: 0p";
      ptsTag.style.display = "block";
    }
  }
};

const handleStockInfoUpdate = () => {
  let infoMsg = "";
  prodList.forEach((item) => {
    if (item.quantity < 5) {
      if (item.quantity > 0) {
        infoMsg = `${infoMsg} ${item.name}: 재고 부족 (${item.quantity}개 남음)\n`;
      } else {
        infoMsg = `${infoMsg} ${item.name}: 품절\n`;
      }
    }
  });
  stockInfo.textContent = infoMsg;
};

const doUpdatePricesInCart = () => {
  let cartItems = cartItemBox.children;
  for (let i = 0; i < cartItems.length; i++) {
    const itemId = cartItems[i].id;
    let product = null;
    for (let productIdx = 0; productIdx < prodList.length; productIdx++) {
      if (prodList[productIdx].id === itemId) {
        product = prodList[productIdx];
        break;
      }
    }
    if (product) {
      const priceDiv = cartItems[i].querySelector(".text-lg");
      const nameDiv = cartItems[i].querySelector("h3");
      if (product.onSale && product.suggestSale) {
        priceDiv.innerHTML = `<span class="line-through text-gray-400">₩${product.originalPrice.toLocaleString()}</span> <span class="text-purple-600">₩${product.price.toLocaleString()}</span>`;
        nameDiv.textContent = `⚡💝${product.name}`;
      } else if (product.onSale) {
        priceDiv.innerHTML = `<span class="line-through text-gray-400">₩${product.originalPrice.toLocaleString()}</span> <span class="text-red-500">₩${product.price.toLocaleString()}</span>`;
        nameDiv.textContent = "⚡" + product.name;
      } else if (product.suggestSale) {
        priceDiv.innerHTML = `<span class="line-through text-gray-400">₩${product.originalPrice.toLocaleString()}</span> <span class="text-blue-500">₩${product.price.toLocaleString()}</span>`;
        nameDiv.textContent = "💝" + product.name;
      } else {
        priceDiv.textContent = "₩" + product.price.toLocaleString();
        nameDiv.textContent = product.name;
      }
    }
  }
  handleCalculateCartStuff();
};

main();
addBtn.addEventListener("click", () => {
  const selItem = productSelector.value;
  let hasItem = false;
  for (let idx = 0; idx < prodList.length; idx++) {
    if (prodList[idx].id === selItem) {
      hasItem = true;
      break;
    }
  }
  if (!selItem || !hasItem) {
    return;
  }
  let itemToAdd = null;
  for (let j = 0; j < prodList.length; j++) {
    if (prodList[j].id === selItem) {
      itemToAdd = prodList[j];
      break;
    }
  }
  if (itemToAdd && itemToAdd.quantity > 0) {
    const item = document.getElementById(itemToAdd["id"]);
    if (item) {
      const qtyElem = item.querySelector(".quantity-number");
      const newQty = parseInt(qtyElem["textContent"]) + 1;
      if (newQty <= itemToAdd.quantity + parseInt(qtyElem.textContent)) {
        qtyElem.textContent = newQty;
        itemToAdd["quantity"]--;
      } else {
        alert("재고가 부족합니다.");
      }
    } else {
      const cartItem = CartItem(itemToAdd);
      cartItemBox.appendChild(cartItem);
      itemToAdd.quantity--;
    }
    handleCalculateCartStuff();
    lastSel = selItem;
  }
});
cartItemBox.addEventListener("click", (event) => {
  const tgt = event.target;
  if (
    tgt.classList.contains("quantity-change") ||
    tgt.classList.contains("remove-item")
  ) {
    const prodId = tgt.dataset.productId;
    const itemElem = document.getElementById(prodId);
    let prod = null;
    for (let prdIdx = 0; prdIdx < prodList.length; prdIdx++) {
      if (prodList[prdIdx].id === prodId) {
        prod = prodList[prdIdx];
        break;
      }
    }
    if (tgt.classList.contains("quantity-change")) {
      const qtyChange = parseInt(tgt.dataset.change);
      const qtyElem = itemElem.querySelector(".quantity-number");
      const currentQty = parseInt(qtyElem.textContent);
      const newQty = currentQty + qtyChange;
      if (newQty > 0 && newQty <= prod.quantity + currentQty) {
        qtyElem.textContent = newQty;
        prod.quantity -= qtyChange;
      } else if (newQty <= 0) {
        prod.quantity += currentQty;
        itemElem.remove();
      } else {
        alert("재고가 부족합니다.");
      }
    } else if (tgt.classList.contains("remove-item")) {
      const qtyElem = itemElem.querySelector(".quantity-number");
      const remQty = parseInt(qtyElem.textContent);
      prod.quantity += remQty;
      itemElem.remove();
    }
    handleCalculateCartStuff();
    onUpdateSelectOptions();
  }
});
