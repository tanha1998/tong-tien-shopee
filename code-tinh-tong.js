const PAGE_SIZE = 20;

let totalOrders = 0;
let totalSavedAmount = 0;
let totalPaidAmount = 0;
let totalOriginalAmount = 0;
let totalProductsBought = 0;

async function fetchOrderStatistics(offset = 0) {
  try {
    const response = await fetch(`https://shopee.vn/api/v4/order/get_order_list?list_type=3&offset=${offset}&limit=${PAGE_SIZE}`);
    if (!response.ok) throw new Error(`API call failed with status ${response.status}`);
    
    const result = await response.json();
    const orders = result.data.details_list;

    totalOrders += orders.length;

    orders.forEach(order => {
      const finalTotal = order.info_card.final_total / 100000;
      totalPaidAmount += finalTotal;

      order.info_card.order_list_cards.forEach(card => {
        card.product_info.item_groups.forEach(group => {
          group.items.forEach(item => {
            totalProductsBought += item.amount;
            totalOriginalAmount += item.order_price / 100000;
          });
        });
      });
    });

    if (orders.length >= PAGE_SIZE) {
      console.log(`Fetched ${totalOrders} orders. Loading more data...`);
      await fetchOrderStatistics(offset + PAGE_SIZE);
    } else {
      displayStatistics();
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

function displayStatistics() {
  totalSavedAmount = totalOriginalAmount - totalPaidAmount;
  console.log("================================");
  console.log(`%c${getShopeeAddictionLevel(totalPaidAmount)}`, "font-size: 26px; font-weight: bold;");
  console.log(`%c(1) Tổng tiền đã chi trên Shopee: %c${formatPrice(totalPaidAmount)} VNĐ`, "font-size: 20px;", "font-size: 26px; color: orange; font-weight: bold;");
  console.log("================================");
  console.log(`%c(2) Tổng số đơn hàng đã giao: %c${formatPrice(totalOrders)} đơn hàng`, "font-size: 20px;", "font-size: 20px; color: green;");
  console.log(`%c(3) Số lượng sản phẩm đã đặt: %c${formatPrice(totalProductsBought)} sản phẩm`, "font-size: 20px;", "font-size: 20px; color: red;");
  console.log(`%c(4) Tiết kiệm được nhờ mã giảm giá: %c${formatPrice(totalSavedAmount)} VNĐ`, "font-size: 18px;", "font-size: 18px; color: green;");
  console.log(`%c💰 TỔNG TIẾT KIỆM: %c${formatPrice(totalSavedAmount)} VNĐ`, "font-size: 24px;", "font-size: 24px; color: orange; font-weight: bold;");
}

function getShopeeAddictionLevel(amount) {
  if (amount <= 10_000_000) {
    return "HÊN QUÁ! BẠN CHƯA BỊ SHOPEE GÂY NGHIỆN 😍";
  } else if (amount <= 50_000_000) {
    return "THÔI XONG! BẠN BẮT ĐẦU NGHIỆN SHOPEE RỒI 😂";
  } else if (amount <= 80_000_000) {
    return "ỐI GIỜI ƠI! BẠN LÀ CON NGHIỆN SHOPEE CHÍNH HIỆU 😱";
  } else {
    return "XÓA APP SHOPEE THÔI! BẠN NGHIỆN SHOPEE NẶNG QUÁ RỒI 😝";
  }
}

function formatPrice(number, fixed = 0) {
  if (isNaN(number)) return '0';
  return Number(number.toFixed(fixed)).toLocaleString('vi-VN');
}

// Start the statistics fetching
fetchOrderStatistics();
