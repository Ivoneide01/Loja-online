import React, { useState, useMemo } from "react";
import { X, Menu, ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  title: string;
  category: string;
  brand: string;
  price: string;
  rating: string;
  img: null;
  promo: boolean;
  ageRange?: string;
}

interface CartItem extends Product {
  qty: number;
}

interface Customer {
  name: string;
  cpf: string;
  cep: string;
  address: string;
}

type PaymentMethod = "pix" | "credit" | "debit";

const BRAND_TECH = ["Apple", "Xiaomi", "Samsung", "Motorola"];
const BRAND_TOOLS = ["Bosch", "Makita", "Bonvink"];
const PIX_KEYS = ["63455081000134", "11932539543"];

function generateProducts() {
  const products = [];
  for (let i = 1; i <= 100; i++) {
    const brand = BRAND_TECH[i % BRAND_TECH.length];
    products.push({
      id: `tech-${i}`,
      title: `${brand} Modelo ${2025}-${i}`,
      category: "Tecnologia",
      brand,
      price: (999 + (i % 50) * 10).toFixed(2),
      rating: (3 + (i % 3)).toFixed(1),
      img: null,
      promo: i % 7 === 0,
    });
  }
  for (let i = 1; i <= 100; i++) {
    const age = 3 + (i % 8);
    products.push({
      id: `toy-${i}`,
      title: `Brinquedo ${i} (Idade ${age}+)`,
      category: "Brinquedos",
      brand: "Variados",
      ageRange: `${age} anos`,
      price: (29 + (i % 20) * 5).toFixed(2),
      rating: (4 + ((i + 1) % 2)).toFixed(1),
      img: null,
      promo: i % 11 === 0,
    });
  }
  for (let i = 1; i <= 100; i++) {
    products.push({
      id: `home-${i}`,
      title: `Item Casa ${i}`,
      category: "Casa",
      brand: "Variados",
      price: (19 + (i % 40) * 3).toFixed(2),
      rating: (3 + (i % 2)).toFixed(1),
      img: null,
      promo: i % 13 === 0,
    });
  }
  for (let i = 1; i <= 100; i++) {
    const brand = BRAND_TOOLS[i % BRAND_TOOLS.length];
    products.push({
      id: `tool-${i}`,
      title: `${brand} Ferramenta ${i}`,
      category: "Ferramentas",
      brand,
      price: (149 + (i % 60) * 7).toFixed(2),
      rating: (4 + ((i + 2) % 2)).toFixed(1),
      img: null,
      promo: i % 9 === 0,
    });
  }
  for (let i = 1; i <= 100; i++) {
    products.push({
      id: `auto-${i}`,
      title: `Auto Produto ${i}`,
      category: "Automotivos",
      brand: "Variados",
      price: (49 + (i % 70) * 6).toFixed(2),
      rating: (3 + (i % 2)).toFixed(1),
      img: null,
      promo: i % 8 === 0,
    });
  }
  return products;
}

const initialProducts = generateProducts();

const sampleReviews = [
  {
    name: "Dona Maria",
    date: "2009-11-15",
    text: "Recebi antes do prazo, produto em perfeito estado. Recomendo!",
  },
  {
    name: "Edilene",
    date: "2018-06-02",
    text: "Atendimento excelente e entrega muito rápida.",
  },
  {
    name: "Carlos",
    date: "2021-12-10",
    text: "Produto exatamente como anunciado. Nota 10.",
  },
  {
    name: "Roberto",
    date: "2025-08-21",
    text: "Comprei um presente para minha filha e ela adorou. Entrega rápida!",
  },
];

const satisfiedImages = [
  "https://via.placeholder.com/300x200?text=Entrega+1",
  "https://via.placeholder.com/300x200?text=Entrega+2",
  "https://via.placeholder.com/300x200?text=Cliente+Satisfeito+1",
  "https://via.placeholder.com/300x200?text=Cliente+Satisfeito+2",
  "https://via.placeholder.com/300x200?text=Entrega+3",
  "https://via.placeholder.com/300x200?text=Cliente+Feliz",
];

export default function Home() {
  const [products] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [brandFilter, setBrandFilter] = useState("Todos");
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    cpf: "",
    cep: "",
    address: "",
  });
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [loadingPayment, setLoadingPayment] = useState(false);

  const categories = useMemo(
    () => ["Todos", "Tecnologia", "Brinquedos", "Casa", "Ferramentas", "Automotivos"],
    []
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "Todos" && p.category !== category) return false;
      if (brandFilter !== "Todos" && p.brand !== brandFilter) return false;
      if (onlyPromo && !p.promo) return false;
      const price = parseFloat(p.price);
      if (price < minPrice || price > maxPrice) return false;
      if (query && !p.title.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [products, category, brandFilter, onlyPromo, minPrice, maxPrice, query]);

  function addToCart(product: Product) {
    const existing = cart.find((c) => c.id === product.id);
    if (existing)
      setCart(
        cart.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c
        )
      );
    else setCart([...cart, { ...product, qty: 1 }]);
  }

  function removeFromCart(id: string) {
    setCart(cart.filter((c) => c.id !== id));
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map((c) => (c.id === id ? { ...c, qty } : c)));
    }
  }

  function startCheckout() {
    setCheckoutOpen(true);
  }

  async function confirmPayment() {
    setLoadingPayment(true);
    try {
      if (paymentMethod === "pix") {
        const pixKey = PIX_KEYS[Math.floor(Math.random() * PIX_KEYS.length)];
        alert(
          `Confirme o pagamento via PIX\n\nChave PIX: ${pixKey}\n\nValor: R$ ${totalPrice}\n\nApós o pagamento, envie o comprovante pelo WhatsApp (11) 98326-1493.`
        );
        setCart([]);
        setCheckoutOpen(false);
      } else if (paymentMethod === "credit" || paymentMethod === "debit") {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart.map((item) => ({
              name: item.title,
              price: Math.round(parseFloat(item.price) * 100),
              quantity: item.qty,
            })),
            customer: customer,
            paymentMethod: paymentMethod,
          }),
        });

        const data = await response.json();
        if (data.checkoutUrl) {
          window.open(data.checkoutUrl, "_blank");
          setCart([]);
          setCheckoutOpen(false);
        } else {
          alert("Erro ao processar pagamento. Tente novamente.");
        }
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoadingPayment(false);
    }
  }

  const totalPrice = cart.reduce((s, c) => s + parseFloat(c.price) * c.qty, 0).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                M
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-extrabold text-orange-600 truncate">
                  Mextill
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Eletrônicos • Entregamos para todo o Brasil
                </p>
              </div>
            </div>

            {/* Desktop Support Info */}
            <div className="hidden md:block text-right text-sm">
              <p className="font-semibold text-gray-800">Suporte:</p>
              <p className="text-gray-700 text-xs">WhatsApp (11) 98326-1493</p>
              <p className="text-gray-700 text-xs">maxtilleletronicos4@gmail.com</p>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-orange-100 rounded-lg transition"
            >
              <Menu size={24} className="text-orange-600" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative p-2 hover:bg-orange-100 rounded-lg transition flex-shrink-0"
            >
              <ShoppingCart size={24} className="text-orange-600" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar - Mobile Drawer / Desktop Sidebar */}
          <aside
            className={`fixed md:relative inset-0 md:inset-auto z-30 bg-white rounded-2xl p-4 shadow md:col-span-1 transition-all duration-300 ${
              sidebarOpen ? "block" : "hidden md:block"
            }`}
          >
            <div className="flex items-center justify-between mb-4 md:hidden">
              <h2 className="font-bold text-lg text-orange-600">Filtros</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-orange-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="font-bold text-lg text-orange-600 hidden md:block mb-4">
              Filtros
            </h2>

            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto md:max-h-none">
              <div>
                <label className="block text-sm font-semibold mb-2">Pesquisar</label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Buscar produto..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Marca</label>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option>Todos</option>
                  <option>Apple</option>
                  <option>Xiaomi</option>
                  <option>Samsung</option>
                  <option>Motorola</option>
                  <option>Bosch</option>
                  <option>Makita</option>
                  <option>Bonvink</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="promo"
                  type="checkbox"
                  checked={onlyPromo}
                  onChange={(e) => setOnlyPromo(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="promo" className="text-sm">
                  Somente promoções
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Preço</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-1/2 border rounded p-2 text-sm"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-1/2 border rounded p-2 text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              <button
                className="w-full bg-orange-600 text-white p-2 rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
                onClick={() => {
                  setCategory("Todos");
                  setBrandFilter("Todos");
                  setOnlyPromo(false);
                  setQuery("");
                  setMinPrice(0);
                  setMaxPrice(10000);
                }}
              >
                Limpar filtros
              </button>

              <div className="text-sm text-gray-600 pt-4 border-t">
                <p className="font-semibold text-gray-800 mb-2">Comentários de clientes</p>
                <ul className="space-y-2">
                  {sampleReviews.map((r) => (
                    <li key={r.name} className="bg-orange-50 p-2 rounded text-xs">
                      <div className="font-semibold">
                        {r.name}{" "}
                        <span className="text-xs text-gray-500">{r.date}</span>
                      </div>
                      <div className="text-xs mt-1">{r.text}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <section className="md:col-span-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-orange-600">Produtos</h2>
              <div className="text-sm text-gray-600 bg-orange-50 px-3 py-1 rounded-full">
                {filtered.length} resultados
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filtered.slice(0, 60).map((p) => (
                <article
                  key={p.id}
                  className="bg-white rounded-2xl p-3 sm:p-4 shadow flex flex-col justify-between hover:shadow-lg transition"
                >
                  <div>
                    <div className="h-24 sm:h-32 lg:h-36 bg-gradient-to-br from-orange-100 to-orange-200 rounded mb-3 flex items-center justify-center text-gray-500 font-semibold text-sm sm:text-base">
                      Imagem
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {p.brand} • {p.category}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-base sm:text-lg font-bold text-orange-600">
                        R$ {p.price}
                      </div>
                      {p.promo && (
                        <div className="text-xs text-orange-600 font-semibold">
                          Em promoção
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        className="px-2 sm:px-3 py-1 bg-orange-600 text-white rounded-md text-xs sm:text-sm font-semibold hover:bg-orange-700 transition whitespace-nowrap"
                        onClick={() => addToCart(p)}
                      >
                        Adicionar
                      </button>
                      <button className="px-2 sm:px-3 py-1 border border-orange-600 text-orange-600 rounded-md text-xs sm:text-sm font-semibold hover:bg-orange-50 transition whitespace-nowrap">
                        Ver
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCartOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white rounded-l-2xl shadow-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-orange-600 text-lg">
                Carrinho ({cart.length})
              </h3>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-orange-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {cart.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-8">
                  Seu carrinho está vazio.
                </div>
              )}
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{item.title}</div>
                    <div className="text-xs text-gray-500">
                      R$ {item.price} x {item.qty}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-2">
                    <input
                      type="number"
                      className="w-12 border rounded p-1 text-xs"
                      value={item.qty}
                      onChange={(e) => updateQty(item.id, Number(e.target.value))}
                      min="1"
                    />
                    <button
                      className="text-xs text-red-500 hover:text-red-700 font-semibold"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-gray-800">Total</div>
                <div className="font-bold text-orange-600 text-lg">R$ {totalPrice}</div>
              </div>
              <button
                disabled={cart.length === 0}
                className="w-full bg-orange-600 text-white p-2 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={startCheckout}
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Cart Sidebar */}
      <div className="hidden md:block fixed right-6 bottom-6 w-96 bg-white rounded-2xl shadow-lg p-4 border border-orange-100 max-h-[calc(100vh-100px)] overflow-hidden flex flex-col">
        <h3 className="font-bold text-orange-600 text-lg">Carrinho ({cart.length})</h3>
        <div className="mt-2 flex-1 overflow-y-auto">
          {cart.length === 0 && (
            <div className="text-sm text-gray-500">Seu carrinho está vazio.</div>
          )}
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-semibold text-gray-800">{item.title}</div>
                <div className="text-sm text-gray-500">
                  R$ {item.price} x {item.qty}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <input
                  type="number"
                  className="w-16 border rounded p-1 text-sm"
                  value={item.qty}
                  onChange={(e) => updateQty(item.id, Number(e.target.value))}
                  min="1"
                />
                <button
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <div className="font-bold">Total</div>
          <div className="font-bold text-orange-600 text-lg">R$ {totalPrice}</div>
        </div>
        <button
          disabled={cart.length === 0}
          className="mt-3 w-full bg-orange-600 text-white p-2 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={startCheckout}
        >
          Finalizar Compra
        </button>
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-orange-600">
                Cadastro - Entrega para todo o Brasil
              </h3>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <input
                placeholder="Nome completo"
                className="p-2 border rounded text-sm"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
              />
              <input
                placeholder="CPF"
                className="p-2 border rounded text-sm"
                value={customer.cpf}
                onChange={(e) =>
                  setCustomer({ ...customer, cpf: e.target.value })
                }
              />
              <input
                placeholder="CEP"
                className="p-2 border rounded text-sm"
                value={customer.cep}
                onChange={(e) =>
                  setCustomer({ ...customer, cep: e.target.value })
                }
              />
              <input
                placeholder="Endereço completo"
                className="p-2 border rounded text-sm"
                value={customer.address}
                onChange={(e) =>
                  setCustomer({ ...customer, address: e.target.value })
                }
              />
            </div>

            {/* Payment Method Selection */}
            <div className="mt-4 space-y-3">
              <p className="font-semibold text-gray-800 text-sm">Escolha o meio de pagamento:</p>

              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition"
                style={{
                  borderColor: paymentMethod === "pix" ? "#ea580c" : "#e5e7eb",
                  backgroundColor: paymentMethod === "pix" ? "#fff7ed" : "white"
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={paymentMethod === "pix"}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">PIX</p>
                  <p className="text-xs text-gray-600">Transferência instantânea</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition"
                style={{
                  borderColor: paymentMethod === "credit" ? "#ea580c" : "#e5e7eb",
                  backgroundColor: paymentMethod === "credit" ? "#fff7ed" : "white"
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="credit"
                  checked={paymentMethod === "credit"}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Cartão de Crédito</p>
                  <p className="text-xs text-gray-600">Parcelado em até 12x</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition"
                style={{
                  borderColor: paymentMethod === "debit" ? "#ea580c" : "#e5e7eb",
                  backgroundColor: paymentMethod === "debit" ? "#fff7ed" : "white"
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="debit"
                  checked={paymentMethod === "debit"}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Cartão de Débito</p>
                  <p className="text-xs text-gray-600">Debitado na hora</p>
                </div>
              </label>
            </div>

            {/* Payment Info */}
            {paymentMethod === "pix" && (
              <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-200">
                <p className="font-semibold text-gray-800 text-sm">Pagamento via PIX</p>
                <p className="text-xs text-gray-600 mt-2">
                  Você receberá uma chave PIX aleatória para transferir o valor de <strong>R$ {totalPrice}</strong>.
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Após o pagamento, envie o comprovante pelo WhatsApp: <strong>(11) 98326-1493</strong>
                </p>
              </div>
            )}

            {(paymentMethod === "credit" || paymentMethod === "debit") && (
              <div className="mt-4 bg-green-50 p-3 rounded border border-green-200">
                <p className="font-semibold text-gray-800 text-sm">Pagamento com Cartão</p>
                <p className="text-xs text-gray-600 mt-2">
                  Você será redirecionado para a página segura de pagamento da Stripe.
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Valor total: <strong>R$ {totalPrice}</strong>
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-50 transition text-sm font-semibold"
                onClick={() => setCheckoutOpen(false)}
              >
                Voltar
              </button>
              <button
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={confirmPayment}
                disabled={loadingPayment}
              >
                {loadingPayment ? "Processando..." : `Confirmar Pagamento (${paymentMethod === "pix" ? "PIX" : paymentMethod === "credit" ? "Crédito" : "Débito"})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Satisfied Customers Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-orange-600 mb-4 sm:mb-6 text-center">
          📸 Clientes Satisfeitos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {satisfiedImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Cliente ${i + 1}`}
              className="rounded-xl shadow cursor-pointer hover:scale-105 transition-transform w-full h-auto"
              onClick={() => setLightboxImg(src)}
            />
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImg(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImg}
              alt="Lightbox"
              className="w-full rounded-lg"
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
