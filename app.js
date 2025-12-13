// ========================================
// ExpenseFlow - Budget Tracker App
// ========================================

// Category Configuration
const CATEGORIES = {
    food: { name: 'Food & Dining', icon: '🍕', color: '#ff6b6b' },
    transport: { name: 'Transportation', icon: '🚗', color: '#4ecdc4' },
    housing: { name: 'Housing', icon: '🏠', color: '#45b7d1' },
    shopping: { name: 'Shopping', icon: '🛒', color: '#f7dc6f' },
    entertainment: { name: 'Entertainment', icon: '🎮', color: '#bb8fce' },
    healthcare: { name: 'Healthcare', icon: '💊', color: '#58d68d' },
    education: { name: 'Education', icon: '📚', color: '#5dade2' },
    travel: { name: 'Travel', icon: '✈️', color: '#f0b27a' },
    bills: { name: 'Bills & Utilities', icon: '💼', color: '#e74c3c' },
    clothing: { name: 'Clothing & Fashion', icon: '👔', color: '#9b59b6' },
    fitness: { name: 'Fitness & Gym', icon: '💪', color: '#27ae60' },
    personalcare: { name: 'Personal Care', icon: '💇', color: '#e91e63' },
    gifts: { name: 'Gifts & Donations', icon: '🎁', color: '#ff9800' },
    pets: { name: 'Pets', icon: '🐕', color: '#795548' },
    subscriptions: { name: 'Subscriptions', icon: '📱', color: '#673ab7' },
    coffee: { name: 'Coffee & Drinks', icon: '☕', color: '#8d6e63' },
    repairs: { name: 'Repairs & Maintenance', icon: '🔧', color: '#607d8b' },
    savings: { name: 'Savings & Investments', icon: '💰', color: '#ffc107' }
};

// Default Budget Goals
const DEFAULT_BUDGETS = {
    food: 500,
    transport: 200,
    shopping: 300,
    entertainment: 150,
    bills: 300,
    clothing: 200,
    fitness: 100,
    personalcare: 100,
    gifts: 150,
    pets: 100,
    subscriptions: 200,
    coffee: 100,
    repairs: 100,
    savings: 500
};

// App State
let state = {
    transactions: [],
    budgets: { ...DEFAULT_BUDGETS },
    income: 5000
};

// Charts
let categoryChart = null;
let trendChart = null;

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    updateDate();
    renderSummaryCards();
    initializeCharts();
    renderBudgetGoals();
    renderInsights();
    renderTransactions();
}

function loadFromStorage() {
    const saved = localStorage.getItem('expenseFlowData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            state.transactions = data.transactions || [];
            state.budgets = data.budgets || { ...DEFAULT_BUDGETS };
            state.income = data.income || 0;
        } catch (e) {
            console.error('Error loading data from storage:', e);
            state.transactions = [];
            state.budgets = { ...DEFAULT_BUDGETS };
            state.income = 0;
        }
    }
}

function saveToStorage() {
    localStorage.setItem('expenseFlowData', JSON.stringify(state));
}

function addSampleData() {
    // Start fresh with no transactions
    state.transactions = [];
    saveToStorage();
}

// ========================================
// Date Utilities
// ========================================
function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', options);
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today - 86400000);

    if (dateStr === formatDate(today)) return 'Today';
    if (dateStr === formatDate(yesterday)) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ========================================
// Summary Cards
// ========================================
function renderSummaryCards() {
    const monthlyIncome = getMonthlyIncome();
    const monthlyExpenses = getMonthlyExpenses();
    const balance = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? ((balance / monthlyIncome) * 100).toFixed(0) : 0;

    document.getElementById('totalBalance').textContent = formatCurrency(balance);
    document.getElementById('monthlyIncome').textContent = formatCurrency(monthlyIncome);
    document.getElementById('monthlyExpenses').textContent = formatCurrency(monthlyExpenses);
    document.getElementById('savingsRate').textContent = `${savingsRate}%`;
}

function getMonthlyIncome() {
    const thisMonth = new Date().getMonth();
    return state.transactions
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === thisMonth)
        .reduce((sum, t) => sum + t.amount, 0) || state.income;
}

function getMonthlyExpenses() {
    const thisMonth = new Date().getMonth();
    return state.transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === thisMonth)
        .reduce((sum, t) => sum + t.amount, 0);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

// ========================================
// Charts
// ========================================
function initializeCharts() {
    initCategoryChart();
    initTrendChart();
}

function initCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const data = getCategoryData();

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: data.colors,
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgba(255,255,255,0.7)',
                        padding: 15,
                        font: { family: 'Inter', size: 12 },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
}

function initTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const data = getTrendData();

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Spending',
                data: data.values,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter' } }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                        color: 'rgba(255,255,255,0.5)',
                        font: { family: 'Inter' },
                        callback: value => '$' + value
                    }
                }
            }
        }
    });
}

function getCategoryData() {
    const categoryTotals = {};

    state.transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

    const labels = [];
    const values = [];
    const colors = [];

    Object.keys(categoryTotals).forEach(cat => {
        if (CATEGORIES[cat]) {
            labels.push(CATEGORIES[cat].name);
            values.push(categoryTotals[cat]);
            colors.push(CATEGORIES[cat].color);
        }
    });

    return { labels, values, colors };
}

function getTrendData() {
    const days = 7;
    const labels = [];
    const values = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today - i * 86400000);
        const dateStr = formatDate(date);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

        const dayTotal = state.transactions
            .filter(t => t.type === 'expense' && t.date === dateStr)
            .reduce((sum, t) => sum + t.amount, 0);
        values.push(dayTotal);
    }

    return { labels, values };
}

function updateCharts() {
    const catData = getCategoryData();
    categoryChart.data.labels = catData.labels;
    categoryChart.data.datasets[0].data = catData.values;
    categoryChart.data.datasets[0].backgroundColor = catData.colors;
    categoryChart.update();

    const trendData = getTrendData();
    trendChart.data.labels = trendData.labels;
    trendChart.data.datasets[0].data = trendData.values;
    trendChart.update();
}

// ========================================
// Budget Goals
// ========================================
function renderBudgetGoals() {
    const budgetList = document.getElementById('budgetList');
    budgetList.innerHTML = '';

    Object.keys(state.budgets).forEach(cat => {
        const budget = state.budgets[cat];
        const spent = state.transactions
            .filter(t => t.type === 'expense' && t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);

        const percentage = Math.min((spent / budget) * 100, 100);
        const status = percentage < 70 ? 'safe' : percentage < 90 ? 'warning' : 'danger';

        const item = document.createElement('div');
        item.className = 'budget-item';
        item.innerHTML = `
            <div class="budget-header">
                <div class="budget-label">
                    <span class="category-icon">${CATEGORIES[cat].icon}</span>
                    <span>${CATEGORIES[cat].name}</span>
                </div>
                <span class="budget-amount">${formatCurrency(spent)} / ${formatCurrency(budget)}</span>
            </div>
            <div class="budget-progress">
                <div class="budget-progress-bar ${status}" style="width: ${percentage}%"></div>
            </div>
        `;
        budgetList.appendChild(item);
    });
}

// ========================================
// Insights
// ========================================
function renderInsights() {
    const insightsList = document.getElementById('insightsList');
    insightsList.innerHTML = '';

    const insights = generateInsights();

    insights.forEach(insight => {
        const item = document.createElement('div');
        item.className = `insight-item ${insight.type}`;
        item.innerHTML = `
            <span class="insight-icon">${insight.icon}</span>
            <div class="insight-content">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-text">${insight.text}</div>
            </div>
        `;
        insightsList.appendChild(item);
    });
}

function generateInsights() {
    const insights = [];
    const expenses = state.transactions.filter(t => t.type === 'expense');

    // Top spending category
    const catTotals = {};
    expenses.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });

    const topCat = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a])[0];
    if (topCat) {
        insights.push({
            type: 'info',
            icon: '📊',
            title: 'Top Spending Category',
            text: `${CATEGORIES[topCat].name} with ${formatCurrency(catTotals[topCat])} spent this month.`
        });
    }

    // Daily average
    const uniqueDays = [...new Set(expenses.map(t => t.date))].length || 1;
    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    const dailyAvg = totalSpent / uniqueDays;

    insights.push({
        type: 'info',
        icon: '📈',
        title: 'Daily Average',
        text: `You spend around ${formatCurrency(dailyAvg)} per day on average.`
    });

    // Budget alerts
    Object.keys(state.budgets).forEach(cat => {
        const spent = expenses.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0);
        const percentage = (spent / state.budgets[cat]) * 100;

        if (percentage >= 90) {
            insights.push({
                type: 'danger',
                icon: '⚠️',
                title: `${CATEGORIES[cat].name} Budget Alert`,
                text: `You've used ${percentage.toFixed(0)}% of your budget!`
            });
        } else if (percentage >= 70) {
            insights.push({
                type: 'warning',
                icon: '💡',
                title: `${CATEGORIES[cat].name} Budget Warning`,
                text: `You've used ${percentage.toFixed(0)}% of your budget.`
            });
        }
    });

    // Savings insight
    const monthlyIncome = getMonthlyIncome();
    const monthlyExpenses = getMonthlyExpenses();
    const savings = monthlyIncome - monthlyExpenses;

    if (savings > 0) {
        insights.push({
            type: 'success',
            icon: '🎉',
            title: 'Great Savings!',
            text: `You're saving ${formatCurrency(savings)} this month. Keep it up!`
        });
    }

    return insights.slice(0, 4);
}

// ========================================
// Transactions
// ========================================
function renderTransactions() {
    const list = document.getElementById('transactionsList');
    list.innerHTML = '';

    const recent = [...state.transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    if (recent.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">No transactions yet. Add your first expense!</div>
            </div>
        `;
        return;
    }

    recent.forEach(t => {
        const item = document.createElement('div');
        item.className = 'transaction-item';

        const icon = t.type === 'income' ? '💵' : (CATEGORIES[t.category]?.icon || '💳');
        const catName = t.type === 'income' ? 'Income' : (CATEGORIES[t.category]?.name || 'Other');

        item.innerHTML = `
            <div class="transaction-icon">${icon}</div>
            <div class="transaction-details">
                <div class="transaction-name">${t.description}</div>
                <div class="transaction-category">${catName}</div>
            </div>
            <div class="transaction-right">
                <div class="transaction-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</div>
                <div class="transaction-date">${formatDisplayDate(t.date)}</div>
            </div>
            <div class="transaction-actions">
                <button class="edit-btn" onclick="openEditModal(${t.id})" title="Edit transaction">✏️</button>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})" title="Delete transaction">🗑️</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    // Modal controls
    const expenseModal = document.getElementById('expenseModal');
    const incomeModal = document.getElementById('incomeModal');

    document.getElementById('openAddModal').addEventListener('click', () => openModal(expenseModal));
    document.getElementById('closeModal').addEventListener('click', () => closeModal(expenseModal));
    document.getElementById('cancelExpense').addEventListener('click', () => closeModal(expenseModal));

    document.getElementById('closeIncomeModal').addEventListener('click', () => closeModal(incomeModal));
    document.getElementById('cancelIncome').addEventListener('click', () => closeModal(incomeModal));

    // Quick add
    const quickAddBtn = document.getElementById('quickAddBtn');
    const quickAddOptions = document.getElementById('quickAddOptions');

    quickAddBtn.addEventListener('click', () => {
        quickAddBtn.classList.toggle('active');
        quickAddOptions.classList.toggle('active');
    });

    document.getElementById('quickAddExpense').addEventListener('click', () => {
        quickAddBtn.classList.remove('active');
        quickAddOptions.classList.remove('active');
        openModal(expenseModal);
    });

    document.getElementById('quickAddIncome').addEventListener('click', () => {
        quickAddBtn.classList.remove('active');
        quickAddOptions.classList.remove('active');
        openModal(incomeModal);
    });

    // Category selection
    document.querySelectorAll('.category-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            document.getElementById('expenseCategory').value = opt.dataset.category;
        });
    });

    // Form submissions
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
    document.getElementById('incomeForm').addEventListener('submit', handleIncomeSubmit);

    // Set default date
    document.getElementById('expenseDate').value = formatDate(new Date());
    document.getElementById('incomeDate').value = formatDate(new Date());

    // Close modals on overlay click
    [expenseModal, incomeModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;

            // Update active state
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Handle navigation
            if (section === 'transactions') {
                openTransactionsModal();
            } else if (section === 'budgets') {
                document.querySelector('.budget-goals-card').scrollIntoView({ behavior: 'smooth' });
            } else if (section === 'categories') {
                document.querySelector('.chart-card').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Transactions modal
    const transactionsModal = document.getElementById('transactionsModal');
    document.getElementById('closeTransactionsModal').addEventListener('click', () => closeModal(transactionsModal));
    document.getElementById('viewAllTransactions').addEventListener('click', (e) => {
        e.preventDefault();
        openTransactionsModal();
    });
    transactionsModal.addEventListener('click', (e) => {
        if (e.target === transactionsModal) closeModal(transactionsModal);
    });

    // Edit modal controls
    const editModal = document.getElementById('editModal');
    document.getElementById('closeEditModal').addEventListener('click', () => closeModal(editModal));
    document.getElementById('cancelEdit').addEventListener('click', () => closeModal(editModal));
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeModal(editModal);
    });

    // Edit category selection
    document.querySelectorAll('#editCategorySelect .category-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('#editCategorySelect .category-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            document.getElementById('editCategory').value = opt.dataset.category;
        });
    });

    // Edit form submission
    document.getElementById('editForm').addEventListener('submit', handleEditSubmit);

    // Budget modal controls
    const budgetModal = document.getElementById('budgetModal');
    document.getElementById('editBudgets').addEventListener('click', () => openBudgetModal());
    document.getElementById('closeBudgetModal').addEventListener('click', () => closeModal(budgetModal));
    document.getElementById('cancelBudget').addEventListener('click', () => closeModal(budgetModal));
    budgetModal.addEventListener('click', (e) => {
        if (e.target === budgetModal) closeModal(budgetModal);
    });

    // Budget form submission
    document.getElementById('budgetForm').addEventListener('submit', handleBudgetSubmit);
}

function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

function openTransactionsModal() {
    const modal = document.getElementById('transactionsModal');
    const list = document.getElementById('allTransactionsList');
    list.innerHTML = '';

    const allTransactions = [...state.transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (allTransactions.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">No transactions yet. Add your first expense!</div>
            </div>
        `;
    } else {
        allTransactions.forEach(t => {
            const item = document.createElement('div');
            item.className = 'transaction-item';

            const icon = t.type === 'income' ? '💵' : (CATEGORIES[t.category]?.icon || '💳');
            const catName = t.type === 'income' ? 'Income' : (CATEGORIES[t.category]?.name || 'Other');

            item.innerHTML = `
                <div class="transaction-icon">${icon}</div>
                <div class="transaction-details">
                    <div class="transaction-name">${t.description}</div>
                    <div class="transaction-category">${catName}</div>
                </div>
                <div class="transaction-right">
                    <div class="transaction-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</div>
                    <div class="transaction-date">${formatDisplayDate(t.date)}</div>
                </div>
                <div class="transaction-actions">
                    <button class="edit-btn" onclick="openEditModal(${t.id})" title="Edit transaction">✏️</button>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})" title="Delete transaction">🗑️</button>
                </div>
            `;
            list.appendChild(item);
        });
    }

    openModal(modal);
}

function handleExpenseSubmit(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDescription').value;
    const category = document.getElementById('expenseCategory').value;
    const date = document.getElementById('expenseDate').value;

    if (!category) {
        alert('Please select a category');
        return;
    }

    const transaction = {
        id: Date.now(),
        type: 'expense',
        amount,
        description,
        category,
        date
    };

    state.transactions.push(transaction);
    saveToStorage();

    // Update UI
    renderSummaryCards();
    updateCharts();
    renderBudgetGoals();
    renderInsights();
    renderTransactions();

    // Reset form and close modal
    e.target.reset();
    document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
    document.getElementById('expenseDate').value = formatDate(new Date());
    closeModal(document.getElementById('expenseModal'));
}

function handleIncomeSubmit(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const description = document.getElementById('incomeDescription').value;
    const date = document.getElementById('incomeDate').value;

    const transaction = {
        id: Date.now(),
        type: 'income',
        amount,
        description,
        category: null,
        date
    };

    state.transactions.push(transaction);
    saveToStorage();

    // Update UI
    renderSummaryCards();
    renderTransactions();
    renderInsights();

    // Reset form and close modal
    e.target.reset();
    document.getElementById('incomeDate').value = formatDate(new Date());
    closeModal(document.getElementById('incomeModal'));
}

// ========================================
// Delete Transaction
// ========================================
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveToStorage();

        // Update UI
        renderSummaryCards();
        updateCharts();
        renderBudgetGoals();
        renderInsights();
        renderTransactions();

        // If transactions modal is open, refresh it
        const modal = document.getElementById('transactionsModal');
        if (modal.classList.contains('active')) {
            openTransactionsModal();
        }
    }
}

// ========================================
// Edit Transaction
// ========================================
function openEditModal(id) {
    const transaction = state.transactions.find(t => t.id === id);
    if (!transaction) return;

    const editModal = document.getElementById('editModal');

    // Fill form fields
    document.getElementById('editTransactionId').value = transaction.id;
    document.getElementById('editTransactionType').value = transaction.type;
    document.getElementById('editAmount').value = transaction.amount;
    document.getElementById('editDescription').value = transaction.description;
    document.getElementById('editDate').value = transaction.date;

    // Handle category for expenses
    const categoryGroup = document.getElementById('editCategoryGroup');
    if (transaction.type === 'expense') {
        categoryGroup.style.display = 'block';
        document.getElementById('editCategory').value = transaction.category;

        // Clear previous selection and select current category
        document.querySelectorAll('#editCategorySelect .category-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.category === transaction.category) {
                opt.classList.add('selected');
            }
        });
    } else {
        // Hide category for income
        categoryGroup.style.display = 'none';
    }

    openModal(editModal);
}

function handleEditSubmit(e) {
    e.preventDefault();

    const id = parseInt(document.getElementById('editTransactionId').value);
    const type = document.getElementById('editTransactionType').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    const description = document.getElementById('editDescription').value;
    const date = document.getElementById('editDate').value;
    const category = type === 'expense' ? document.getElementById('editCategory').value : null;

    if (type === 'expense' && !category) {
        alert('Please select a category');
        return;
    }

    // Find and update the transaction
    const index = state.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        state.transactions[index] = {
            ...state.transactions[index],
            amount,
            description,
            category,
            date
        };
        saveToStorage();

        // Update UI
        renderSummaryCards();
        updateCharts();
        renderBudgetGoals();
        renderInsights();
        renderTransactions();

        // If transactions modal is open, refresh it
        const transactionsModal = document.getElementById('transactionsModal');
        if (transactionsModal.classList.contains('active')) {
            openTransactionsModal();
        }

        // Close edit modal
        closeModal(document.getElementById('editModal'));
    }
}

// ========================================
// Budget Goals Editing
// ========================================
function openBudgetModal() {
    const budgetModal = document.getElementById('budgetModal');

    // Pre-fill the form with current budget values
    document.getElementById('budgetFood').value = state.budgets.food || 500;
    document.getElementById('budgetTransport').value = state.budgets.transport || 200;
    document.getElementById('budgetShopping').value = state.budgets.shopping || 300;
    document.getElementById('budgetEntertainment').value = state.budgets.entertainment || 150;
    document.getElementById('budgetBills').value = state.budgets.bills || 300;
    document.getElementById('budgetClothing').value = state.budgets.clothing || 200;
    document.getElementById('budgetFitness').value = state.budgets.fitness || 100;
    document.getElementById('budgetPersonalcare').value = state.budgets.personalcare || 100;
    document.getElementById('budgetGifts').value = state.budgets.gifts || 150;
    document.getElementById('budgetPets').value = state.budgets.pets || 100;
    document.getElementById('budgetSubscriptions').value = state.budgets.subscriptions || 200;
    document.getElementById('budgetCoffee').value = state.budgets.coffee || 100;
    document.getElementById('budgetRepairs').value = state.budgets.repairs || 100;
    document.getElementById('budgetSavings').value = state.budgets.savings || 500;

    openModal(budgetModal);
}

function handleBudgetSubmit(e) {
    e.preventDefault();

    // Get new budget values
    const food = parseFloat(document.getElementById('budgetFood').value) || 0;
    const transport = parseFloat(document.getElementById('budgetTransport').value) || 0;
    const shopping = parseFloat(document.getElementById('budgetShopping').value) || 0;
    const entertainment = parseFloat(document.getElementById('budgetEntertainment').value) || 0;
    const bills = parseFloat(document.getElementById('budgetBills').value) || 0;
    const clothing = parseFloat(document.getElementById('budgetClothing').value) || 0;
    const fitness = parseFloat(document.getElementById('budgetFitness').value) || 0;
    const personalcare = parseFloat(document.getElementById('budgetPersonalcare').value) || 0;
    const gifts = parseFloat(document.getElementById('budgetGifts').value) || 0;
    const pets = parseFloat(document.getElementById('budgetPets').value) || 0;
    const subscriptions = parseFloat(document.getElementById('budgetSubscriptions').value) || 0;
    const coffee = parseFloat(document.getElementById('budgetCoffee').value) || 0;
    const repairs = parseFloat(document.getElementById('budgetRepairs').value) || 0;
    const savings = parseFloat(document.getElementById('budgetSavings').value) || 0;

    // Update state
    state.budgets = {
        food,
        transport,
        shopping,
        entertainment,
        bills,
        clothing,
        fitness,
        personalcare,
        gifts,
        pets,
        subscriptions,
        coffee,
        repairs,
        savings
    };

    // Save to storage
    saveToStorage();

    // Update UI
    renderBudgetGoals();
    renderInsights();

    // Close modal
    closeModal(document.getElementById('budgetModal'));
}
