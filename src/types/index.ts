export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  code: string;
  messages: ChatMessage[];
  userId: string;
  template?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  code: string;
  tags: string[];
}

export interface AISettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface PreviewMode {
  mode: "desktop" | "tablet" | "mobile";
  width: number;
}

export const PREVIEW_MODES: PreviewMode[] = [
  { mode: "desktop", width: 1280 },
  { mode: "tablet", width: 768 },
  { mode: "mobile", width: 375 },
];

export const TEMPLATES: Template[] = [
  {
    id: "saas-dashboard",
    name: "SaaS Dashboard",
    description: "Modern analytics dashboard with charts, metrics, and data tables",
    category: "Dashboard",
    preview: "📊",
    tags: ["charts", "analytics", "metrics"],
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaaS Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen">
  <div class="flex">
    <aside class="w-64 bg-gray-800 min-h-screen p-6">
      <h1 class="text-xl font-bold mb-8">Dashboard</h1>
      <nav class="space-y-2">
        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-600 text-white">Overview</a>
        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700">Analytics</a>
        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700">Users</a>
        <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700">Settings</a>
      </nav>
    </aside>
    <main class="flex-1 p-8">
      <h2 class="text-2xl font-bold mb-6">Overview</h2>
      <div class="grid grid-cols-4 gap-6 mb-8">
        <div class="bg-gray-800 rounded-xl p-6"><div class="text-gray-400 text-sm">Total Revenue</div><div class="text-3xl font-bold mt-2">$48,295</div><div class="text-green-400 text-sm mt-1">+12.5% this month</div></div>
        <div class="bg-gray-800 rounded-xl p-6"><div class="text-gray-400 text-sm">Active Users</div><div class="text-3xl font-bold mt-2">8,492</div><div class="text-green-400 text-sm mt-1">+8.2% this month</div></div>
        <div class="bg-gray-800 rounded-xl p-6"><div class="text-gray-400 text-sm">Conversion Rate</div><div class="text-3xl font-bold mt-2">3.24%</div><div class="text-red-400 text-sm mt-1">-0.5% this month</div></div>
        <div class="bg-gray-800 rounded-xl p-6"><div class="text-gray-400 text-sm">Avg. Session</div><div class="text-3xl font-bold mt-2">4m 32s</div><div class="text-green-400 text-sm mt-1">+1.1% this month</div></div>
      </div>
      <div class="bg-gray-800 rounded-xl p-6"><canvas id="chart" height="100"></canvas></div>
    </main>
  </div>
  <script>
    new Chart(document.getElementById('chart'), {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{label:'Revenue',data:[30000,35000,28000,40000,38000,45000,42000,48000,44000,50000,47000,48295],borderColor:'rgb(139,92,246)',backgroundColor:'rgba(139,92,246,0.1)',fill:true,tension:0.4}]
      },
      options: {plugins:{legend:{labels:{color:'white'}}},scales:{x:{ticks:{color:'gray'}},y:{ticks:{color:'gray'}}}}
    });
  </script>
</body>
</html>`,
  },
  {
    id: "landing-page",
    name: "Landing Page",
    description: "Beautiful SaaS landing page with hero, features, pricing sections",
    category: "Landing Page",
    preview: "🚀",
    tags: ["saas", "marketing", "conversion"],
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaaS Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white">
  <nav class="flex items-center justify-between px-8 py-4 border-b border-gray-800">
    <span class="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">ProductName</span>
    <div class="flex gap-8 text-gray-400">
      <a href="#" class="hover:text-white">Features</a>
      <a href="#" class="hover:text-white">Pricing</a>
      <a href="#" class="hover:text-white">Docs</a>
    </div>
    <button class="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium">Get Started</button>
  </nav>
  <section class="text-center py-32 px-8">
    <h1 class="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">The Future of<br/>Your Workflow</h1>
    <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">Ship faster, collaborate better, and scale effortlessly with our AI-powered platform.</p>
    <div class="flex gap-4 justify-center">
      <button class="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-medium text-lg">Start Free Trial</button>
      <button class="border border-gray-700 hover:border-gray-500 px-8 py-3 rounded-lg font-medium text-lg">Watch Demo</button>
    </div>
  </section>
</body>
</html>`,
  },
  {
    id: "ecommerce",
    name: "E-Commerce Store",
    description: "Product listing page with cart, filters, and checkout flow",
    category: "E-Commerce",
    preview: "🛒",
    tags: ["shop", "products", "cart"],
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shop</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 min-h-screen">
  <nav class="bg-white border-b px-8 py-4 flex justify-between items-center">
    <h1 class="text-xl font-bold">MyShop</h1>
    <div class="flex gap-6 text-gray-600">
      <a href="#" class="hover:text-black">Men</a><a href="#" class="hover:text-black">Women</a><a href="#" class="hover:text-black">Sale</a>
    </div>
    <button class="relative"><span class="text-2xl">🛒</span><span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" id="count">0</span></button>
  </nav>
  <main class="max-w-7xl mx-auto px-8 py-12">
    <h2 class="text-3xl font-bold mb-8">New Arrivals</h2>
    <div class="grid grid-cols-4 gap-6" id="products"></div>
  </main>
  <script>
    const products=[{name:"Classic Tee",price:29,emoji:"👕"},{name:"Denim Jacket",price:89,emoji:"🧥"},{name:"Sneakers",price:119,emoji:"👟"},{name:"Cap",price:24,emoji:"🧢"},{name:"Hoodie",price:59,emoji:"🥷"},{name:"Pants",price:69,emoji:"👖"},{name:"Dress",price:79,emoji:"👗"},{name:"Boots",price:149,emoji:"👢"}];
    let cart=0;
    document.getElementById('products').innerHTML=products.map(p=>\`<div class="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"><div class="bg-gray-100 h-48 flex items-center justify-center text-6xl">\${p.emoji}</div><div class="p-4"><h3 class="font-semibold">\${p.name}</h3><div class="flex justify-between items-center mt-2"><span class="text-lg font-bold">$\${p.price}</span><button onclick="addCart()" class="bg-black text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-800">Add to Cart</button></div></div></div>\`).join('');
    function addCart(){cart++;document.getElementById('count').textContent=cart;}
  </script>
</body>
</html>`,
  },
  {
    id: "blog",
    name: "Blog Platform",
    description: "Clean blog with article listings, categories, and search",
    category: "Blog",
    preview: "✍️",
    tags: ["content", "articles", "writing"],
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
  <header class="bg-white border-b py-6">
    <div class="max-w-4xl mx-auto px-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">The Blog</h1>
      <input type="text" placeholder="Search..." class="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
    </div>
  </header>
  <main class="max-w-4xl mx-auto px-6 py-12">
    <div class="space-y-8">
      <article class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
        <div class="text-blue-600 text-sm font-medium mb-2">TECHNOLOGY</div>
        <h2 class="text-2xl font-bold mb-3 hover:text-blue-600 cursor-pointer">The Future of AI-Powered Development</h2>
        <p class="text-gray-600 mb-4">Explore how artificial intelligence is transforming the way we build software, from code generation to automated testing and deployment.</p>
        <div class="flex items-center gap-4 text-sm text-gray-400">
          <span>Jan 15, 2025</span><span>•</span><span>5 min read</span>
        </div>
      </article>
      <article class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
        <div class="text-purple-600 text-sm font-medium mb-2">DESIGN</div>
        <h2 class="text-2xl font-bold mb-3 hover:text-purple-600 cursor-pointer">Design Systems That Scale</h2>
        <p class="text-gray-600 mb-4">Learn how to build component libraries and design tokens that grow with your team and maintain consistency across products.</p>
        <div class="flex items-center gap-4 text-sm text-gray-400">
          <span>Jan 12, 2025</span><span>•</span><span>8 min read</span>
        </div>
      </article>
    </div>
  </main>
</body>
</html>`,
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Personal developer portfolio with projects and contact",
    category: "Portfolio",
    preview: "🎨",
    tags: ["personal", "projects", "contact"],
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white">
  <nav class="fixed top-0 w-full bg-gray-950/80 backdrop-blur border-b border-gray-800 px-8 py-4 flex justify-between z-10">
    <span class="font-bold text-lg">John Doe</span>
    <div class="flex gap-8 text-gray-400">
      <a href="#about" class="hover:text-white">About</a><a href="#work" class="hover:text-white">Work</a><a href="#contact" class="hover:text-white">Contact</a>
    </div>
  </nav>
  <section class="min-h-screen flex items-center justify-center text-center pt-20">
    <div>
      <div class="text-8xl mb-6">👨‍💻</div>
      <h1 class="text-5xl font-bold mb-4">Hi, I'm John</h1>
      <p class="text-xl text-gray-400 mb-8">Full-stack developer crafting beautiful digital experiences</p>
      <div class="flex gap-4 justify-center">
        <button class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg">View My Work</button>
        <button class="border border-gray-700 hover:border-gray-500 px-6 py-3 rounded-lg">Download CV</button>
      </div>
    </div>
  </section>
</body>
</html>`,
  },
  {
    id: "todo-app",
    name: "Todo App",
    description: "Functional task manager with filters and local storage",
    category: "Productivity",
    preview: "✅",
    tags: ["tasks", "productivity", "lists"],
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900 min-h-screen flex items-center justify-center p-4">
  <div class="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
    <h1 class="text-2xl font-bold text-white mb-6">My Tasks</h1>
    <div class="flex gap-2 mb-6">
      <input type="text" id="input" placeholder="Add a new task..." class="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400">
      <button onclick="addTodo()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">Add</button>
    </div>
    <ul id="todos" class="space-y-3"></ul>
    <div class="mt-4 text-gray-400 text-sm text-center" id="empty">No tasks yet. Add one above!</div>
  </div>
  <script>
    let todos=JSON.parse(localStorage.getItem('todos')||'[]');
    function render(){
      const el=document.getElementById('todos');
      document.getElementById('empty').style.display=todos.length?'none':'block';
      el.innerHTML=todos.map((t,i)=>\`<li class="flex items-center gap-3 bg-gray-700 rounded-lg px-4 py-3"><input type="checkbox" \${t.done?'checked':''} onchange="toggle(\${i})" class="w-4 h-4 accent-purple-500"><span class="flex-1 text-white \${t.done?'line-through opacity-50':''}">\${t.text}</span><button onclick="remove(\${i})" class="text-gray-400 hover:text-red-400">✕</button></li>\`).join('');
    }
    function addTodo(){const v=document.getElementById('input').value.trim();if(!v)return;todos.push({text:v,done:false});document.getElementById('input').value='';save();}
    function toggle(i){todos[i].done=!todos[i].done;save();}
    function remove(i){todos.splice(i,1);save();}
    function save(){localStorage.setItem('todos',JSON.stringify(todos));render();}
    document.getElementById('input').addEventListener('keydown',e=>{if(e.key==='Enter')addTodo();});
    render();
  </script>
</body>
</html>`,
  },
];
