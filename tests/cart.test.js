/**
 * Unit Tests for Cart Math & Calculation Utilities
 */

describe('Cart Calculations Module', () => {
  const calculateCartTotal = (items, taxRate = 0.05, deliveryFee = 30.00) => {
    const subtotal = items.reduce((acc, item) => {
      const price = parseFloat(String(item.price).replace(/[₹$]/g, ''));
      return acc + (price * item.quantity);
    }, 0);

    const tax = Math.round((subtotal * taxRate + Number.EPSILON) * 100) / 100;
    const grandTotal = Math.round((subtotal + tax + deliveryFee + Number.EPSILON) * 100) / 100;

    return {
      subtotal: Math.round((subtotal + Number.EPSILON) * 100) / 100,
      tax,
      deliveryFee,
      grandTotal
    };
  };

  test('calculates correct subtotal, GST, and grand total', () => {
    const cart = [
      { name: 'Pizza', price: '₹299.00', quantity: 2 },
      { name: 'Burger', price: '₹149.00', quantity: 1 }
    ];

    const result = calculateCartTotal(cart);
    expect(result.subtotal).toBe(747.00); // 299*2 + 149 = 747
    expect(result.tax).toBe(37.35);       // 747 * 0.05 = 37.35
    expect(result.deliveryFee).toBe(30.00);
    expect(result.grandTotal).toBe(814.35); // 747 + 37.35 + 30
  });

  test('returns 0 subtotal for empty cart', () => {
    const result = calculateCartTotal([]);
    expect(result.subtotal).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.grandTotal).toBe(30.00); // Delivery fee baseline
  });

  test('handles floating point precision safely', () => {
    const cart = [
      { name: 'Item A', price: '₹19.99', quantity: 3 }
    ];

    const result = calculateCartTotal(cart);
    expect(result.subtotal).toBe(59.97);
    expect(Number.isInteger(result.grandTotal * 100)).toBe(true);
  });
});
