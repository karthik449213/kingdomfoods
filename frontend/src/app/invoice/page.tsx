"use client";

import { useCart } from "../../context/CartContext";

export default function InvoicePage() {
  const { items, getTotal } = useCart();
  const PHONE = "917075543886"; // <-- replace with restaurant phone

  // Format customizations for display
  const formatCustomizations = (customizations: any) => {
    const parts = [];
    if (customizations.noSugar) parts.push("No sugar");
    if (customizations.addChilli) parts.push("Add chilli");
    if (customizations.extraToppings) parts.push("Extra toppings");
    if (customizations.notes) parts.push(customizations.notes);
    return parts.length > 0 ? parts.join(", ") : "None";
  };

  // Format WhatsApp Message
  const generateMessage = () => {
    let message = "Hello, I want to place this order:%0A";

    items.forEach((item) => {
      const custom = formatCustomizations(item.customizations);
      message += `- ${item.name} (Qty: ${item.quantity}`;
      if (custom !== "None") message += `, ${custom}`;
      message += ")%0A";
    });

    message += `Total: ₹${getTotal()}`;

    return message;
  };

  // WhatsApp Redirect
  const handleWhatsAppOrder = () => {
    const message = generateMessage();
    window.location.href = `https://wa.me/${PHONE}?text=${message}`;
  };

  // Call Button
  const handleCall = () => {
    window.location.href = `tel:+91${PHONE}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Invoice</h1>

      {items.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

          <div className="space-y-4 mb-8">
            {items.map((item) => (
              <div
                key={`${item.id}-${JSON.stringify(item.customizations)}`}
                className="border border-gray-300 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <strong className="text-lg">{item.name}</strong>
                  <span className="text-lg font-semibold">₹{item.price}</span>
                </div>
                <p>Qty: {item.quantity}</p>
                <p>Custom requests: {formatCustomizations(item.customizations)}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-xl font-bold text-blue-600">₹{getTotal()}</span>
            </div>
          </div>

          <div className="flex space-x-4">
            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsAppOrder}
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              WhatsApp Order
            </button>

            {/* Call Button */}
            <button
              onClick={handleCall}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Call Restaurant
            </button>
          </div>
        </>
      )}
    </div>
  );
}
