import { useState } from 'react';
import { Plus, Trash2, ShoppingCart, Settings, ChefHat, Target, Sparkles, Dumbbell, Sofa, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const DAYS = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
const DAYS_SHORT = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

const DEFAULT_MACROS = {
  training: { calories: 2400, protein: 180, carbs: 260, fats: 70 },
  rest: { calories: 2000, protein: 165, carbs: 140, fats: 80 }
};

const MACRO_LABELS: Record<string, string> = { calories: 'Calorieën', protein: 'Eiwit (g)', carbs: 'Koolhydraten (g)', fats: 'Vetten (g)' };
const MACRO_LABELS_SHORT: Record<string, string> = { calories: 'Cal', protein: 'P (g)', carbs: 'C (g)', fats: 'F (g)' };

type MacroType = 'training' | 'rest';
type MacroField = 'calories' | 'protein' | 'carbs' | 'fats';
type Category = 'Protein' | 'Carbs' | 'Fats' | 'Veggies' | 'Fruit';

interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Ingredient {
  name: string;
  category: Category;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  unit: string;
}

interface Food extends Ingredient {
  quantity: number;
}

interface Meal {
  id: number;
  name: string;
  foods: Food[];
}

interface DayConfig {
  isTraining: boolean;
  useCustomMacros: boolean;
  customMacros: Macros;
}

interface GroceryItem {
  name: string;
  quantity: number;
  unit: string;
  category: Category;
}

const FitnessMealPlanner = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [selectedDay, setSelectedDay] = useState(0);
  const [mealsPerDay, setMealsPerDay] = useState(6);
  const [linkedMacros, setLinkedMacros] = useState(false);
  const [expandedIngCat, setExpandedIngCat] = useState<Category | null>(null);
  const [baseMacros, setBaseMacros] = useState({ ...DEFAULT_MACROS });

  const [dayConfigs, setDayConfigs] = useState<DayConfig[]>(
    DAYS.map((_, i) => ({
      isTraining: [0, 1, 3, 4].includes(i),
      useCustomMacros: false,
      customMacros: { calories: 0, protein: 0, carbs: 0, fats: 0 }
    }))
  );

  const [favoriteIngredients, setFavoriteIngredients] = useState<Ingredient[]>([
    { name: 'Heel ei', category: 'Protein', calories: 95, protein: 7.7, carbs: 0.9, fats: 6.7, unit: 'stuk' },
    { name: 'Ei eiwit', category: 'Protein', calories: 17, protein: 3.9, carbs: 0, fats: 0.1, unit: 'stuk' },
    { name: 'Kipfilet', category: 'Protein', calories: 100, protein: 22.8, carbs: 0, fats: 0.9, unit: 'gr' },
    { name: 'Kippendij', category: 'Protein', calories: 154, protein: 19, carbs: 0, fats: 8.7, unit: 'gr' },
    { name: 'Tiger Protein Whey', category: 'Protein', calories: 375, protein: 82.5, carbs: 4.5, fats: 2.9, unit: 'gr' },
    { name: 'Havermout', category: 'Carbs', calories: 375, protein: 14, carbs: 59, fats: 7, unit: 'gr' },
    { name: 'Basmati rijst', category: 'Carbs', calories: 354, protein: 7, carbs: 78.5, fats: 0.6, unit: 'gr' },
    { name: 'Aardappelen', category: 'Carbs', calories: 88, protein: 2, carbs: 19, fats: 0, unit: 'gr' },
    { name: 'Quinoa', category: 'Carbs', calories: 372, protein: 15.2, carbs: 60.6, fats: 6.5, unit: 'gr' },
    { name: 'Volkoren pasta', category: 'Carbs', calories: 348, protein: 13, carbs: 65, fats: 2.5, unit: 'gr' },
    { name: 'Pindakaas', category: 'Fats', calories: 615, protein: 28, carbs: 14, fats: 48, unit: 'gr' },
    { name: 'Walnoten', category: 'Fats', calories: 695, protein: 17, carbs: 3, fats: 67, unit: 'gr' },
    { name: 'Avocado', category: 'Fats', calories: 167, protein: 1.7, carbs: 1.6, fats: 17.6, unit: 'stuk' },
    { name: 'Olijfolie', category: 'Fats', calories: 884, protein: 0, carbs: 0, fats: 100, unit: 'ml' },
    { name: 'Bosbessen', category: 'Fruit', calories: 51, protein: 0.8, carbs: 9, fats: 0.6, unit: 'gr' },
    { name: 'Banaan', category: 'Fruit', calories: 94, protein: 1, carbs: 21, fats: 0.3, unit: 'stuk' },
    { name: 'Broccoli', category: 'Veggies', calories: 35, protein: 3, carbs: 4, fats: 0.4, unit: 'gr' },
    { name: 'Spinazie', category: 'Veggies', calories: 25, protein: 3, carbs: 1.6, fats: 0.3, unit: 'gr' },
    { name: 'Asperges', category: 'Veggies', calories: 22, protein: 2.5, carbs: 2, fats: 0, unit: 'gr' }
  ]);

  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    name: '', category: 'Protein', calories: 0, protein: 0, carbs: 0, fats: 0, unit: 'gr'
  });

  const [mealPlans, setMealPlans] = useState<Record<number, Meal[]>>({});

  // --- Helpers ---
  const getMacrosForDay = (dayIdx: number): Macros => {
    const cfg = dayConfigs[dayIdx];
    if (cfg.useCustomMacros) return cfg.customMacros;
    return cfg.isTraining ? baseMacros.training : baseMacros.rest;
  };

  const trainingDayCount = dayConfigs.filter(d => d.isTraining).length;

  const toggleTraining = (dayIdx: number) => {
    const u = [...dayConfigs];
    u[dayIdx] = { ...u[dayIdx], isTraining: !u[dayIdx].isTraining };
    setDayConfigs(u);
  };

  const toggleCustomMacros = (dayIdx: number) => {
    const u = [...dayConfigs];
    const c = u[dayIdx];
    if (!c.useCustomMacros) {
      const base = c.isTraining ? baseMacros.training : baseMacros.rest;
      u[dayIdx] = { ...c, useCustomMacros: true, customMacros: { ...base } };
    } else {
      u[dayIdx] = { ...c, useCustomMacros: false };
    }
    setDayConfigs(u);
  };

  const updateCustomMacro = (dayIdx: number, field: MacroField, value: string) => {
    const u = [...dayConfigs];
    u[dayIdx] = { ...u[dayIdx], customMacros: { ...u[dayIdx].customMacros, [field]: parseInt(value) || 0 } };
    setDayConfigs(u);
  };

  const updateBaseMacro = (type: MacroType, field: MacroField, val: string) => {
    const v = parseInt(val) || 0;
    if (linkedMacros) {
      setBaseMacros({ training: { ...baseMacros.training, [field]: v }, rest: { ...baseMacros.rest, [field]: v } });
    } else {
      setBaseMacros({ ...baseMacros, [type]: { ...baseMacros[type], [field]: v } });
    }
  };

  const calcTotals = (dayIdx: number): Macros => {
    const meals = mealPlans[dayIdx] || [];
    const t = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    meals.forEach(meal => meal.foods.forEach(f => {
      const m = f.unit === 'stuk' ? f.quantity : f.quantity / 100;
      t.calories += f.calories * m; t.protein += f.protein * m; t.carbs += f.carbs * m; t.fats += f.fats * m;
    }));
    return t;
  };

  const addIngredient = () => {
    if (newIngredient.name.trim()) {
      setFavoriteIngredients([...favoriteIngredients, { ...newIngredient }]);
      setNewIngredient({ name: '', category: 'Protein', calories: 0, protein: 0, carbs: 0, fats: 0, unit: 'gr' });
    }
  };

  const mealTemplates = [
    { name: 'Ontbijt', cats: ['Protein', 'Carbs', 'Fruit'] as Category[] },
    { name: 'Snack 1', cats: ['Protein', 'Fats'] as Category[] },
    { name: 'Lunch', cats: ['Protein', 'Carbs', 'Veggies'] as Category[] },
    { name: 'Pre-Workout', cats: ['Protein', 'Carbs'] as Category[] },
    { name: 'Post-Workout', cats: ['Protein', 'Carbs', 'Veggies'] as Category[] },
    { name: 'Avondeten', cats: ['Protein', 'Carbs', 'Fats', 'Veggies'] as Category[] },
    { name: 'Snack Avond', cats: ['Protein', 'Fats'] as Category[] },
    { name: 'Extra Maaltijd', cats: ['Protein', 'Carbs'] as Category[] }
  ];

  const generatePlan = (dayIdx: number) => {
    const macros = getMacrosForDay(dayIdx);
    const meals: Meal[] = [];
    const pPM = macros.protein / mealsPerDay, cPM = macros.carbs / mealsPerDay, fPM = macros.fats / mealsPerDay;
    for (let i = 0; i < mealsPerDay; i++) {
      const tmpl = mealTemplates[i] || { name: `Maaltijd ${i + 1}`, cats: ['Protein', 'Carbs'] as Category[] };
      const foods: Food[] = [];
      tmpl.cats.forEach(cat => {
        const avail = favoriteIngredients.filter(x => x.category === cat);
        if (avail.length > 0) {
          const ing = avail[Math.floor(Math.random() * avail.length)];
          let qty = 100;
          if (ing.unit === 'stuk') {
            qty = cat === 'Protein' && ing.protein > 0 ? Math.max(1, Math.round(pPM / ing.protein)) : 1;
          } else {
            if (cat === 'Protein' && ing.protein > 0) qty = Math.round((pPM / ing.protein) * 100);
            else if (cat === 'Carbs' && ing.carbs > 0) qty = Math.round((cPM / 2 / ing.carbs) * 100);
            else if (cat === 'Fats' && ing.fats > 0) qty = Math.round((fPM / ing.fats) * 100);
            qty = Math.max(10, Math.min(400, qty));
          }
          foods.push({ ...ing, quantity: qty });
        }
      });
      meals.push({ id: i + 1, name: tmpl.name, foods });
    }
    setMealPlans({ ...mealPlans, [dayIdx]: meals });
  };

  const addFoodToMeal = (dayIdx: number, mealId: number, ing: Ingredient) => {
    const u = { ...mealPlans };
    const meals = [...(u[dayIdx] || [])];
    const meal = meals.find(m => m.id === mealId);
    if (meal) { meal.foods = [...meal.foods, { ...ing, quantity: ing.unit === 'stuk' ? 1 : 100 }]; u[dayIdx] = meals; setMealPlans(u); }
  };

  const removeFoodFromMeal = (dayIdx: number, mealId: number, fi: number) => {
    const u = { ...mealPlans };
    const meals = [...(u[dayIdx] || [])];
    const meal = meals.find(m => m.id === mealId);
    if (meal) { meal.foods = meal.foods.filter((_, i) => i !== fi); u[dayIdx] = meals; setMealPlans(u); }
  };

  const updateFoodQty = (dayIdx: number, mealId: number, fi: number, qty: string) => {
    const u = { ...mealPlans };
    const meals = [...(u[dayIdx] || [])];
    const meal = meals.find(m => m.id === mealId);
    if (meal) { meal.foods = meal.foods.map((f, i) => i === fi ? { ...f, quantity: parseFloat(qty) || 0 } : f); u[dayIdx] = meals; setMealPlans(u); }
  };

  const copyPlan = (from: number, to: number) => {
    if (mealPlans[from]) setMealPlans({ ...mealPlans, [to]: JSON.parse(JSON.stringify(mealPlans[from])) });
  };

  const groceryList = (): GroceryItem[] => {
    const m = new Map<string, GroceryItem>();
    Object.values(mealPlans).forEach(meals => (meals || []).forEach(meal => meal.foods.forEach(f => {
      const k = f.name.toLowerCase();
      if (m.has(k)) m.get(k)!.quantity += f.quantity;
      else m.set(k, { name: f.name, quantity: f.quantity, unit: f.unit, category: f.category });
    })));
    return Array.from(m.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const currentMeals = mealPlans[selectedDay] || [];
  const currentTotals = currentMeals.length > 0 ? calcTotals(selectedDay) : null;
  const targetMacros = getMacrosForDay(selectedDay);
  const dayConfig = dayConfigs[selectedDay];

  // --- Shared components ---
  const Toggle = ({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) => (
    <div className="flex items-center gap-3">
      <button onClick={onToggle}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-purple-500' : 'bg-slate-500'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-5' : 'left-0.5'}`} />
      </button>
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  );

  const MacroInputField = ({ label, value, onChange }: { label: string; value: number; onChange: (val: string) => void }) => (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
        className="bg-slate-600 border border-slate-500 focus:border-blue-500 focus:outline-none px-3 py-1.5 rounded-lg w-full text-sm transition-colors" />
    </div>
  );

  const MacroBar = ({ label, value, target, color }: { label: string; value: number; target: number; color: string }) => {
    const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
    const over = value > target * 1.05;
    return (
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-slate-400">{label}</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-sm font-bold ${over ? 'text-red-400' : 'text-white'}`}>{value.toFixed(0)}</span>
            <span className="text-xs text-slate-500">/ {target}</span>
          </div>
        </div>
        <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: over ? '#f87171' : color }} />
        </div>
      </div>
    );
  };

  const MacroCardGroup = ({ type, label, icon: Icon, color }: { type: MacroType; label: string; icon: typeof Calendar; color: string }) => (
    <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/50">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className={color} />
        <h3 className={`font-bold text-sm ${color}`}>{label}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(MACRO_LABELS) as MacroField[]).map(f => (
          <MacroInputField key={f} label={MACRO_LABELS[f]} value={baseMacros[type][f]}
            onChange={(val) => updateBaseMacro(type, f, val)} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 text-white">
      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* Header + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Fitness Meal Planner
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">Weekschema met trainings- en rustdagen</p>
          </div>
          <div className="flex gap-1.5 bg-slate-800 p-1 rounded-xl">
            {[
              { id: 'setup', icon: Settings, label: 'Schema' },
              { id: 'ingredients', icon: ChefHat, label: 'Ingrediënten' },
              { id: 'planner', icon: Target, label: 'Meal Plan' },
              { id: 'grocery', icon: ShoppingCart, label: 'Boodschappen' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}>
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ===== SETUP ===== */}
        {activeTab === 'setup' && (
          <div className="space-y-5">
            {/* Algemeen */}
            <div className="bg-slate-800/60 backdrop-blur rounded-xl p-5 border border-slate-700/50">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Algemeen</h2>
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Maaltijden / dag</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMealsPerDay(Math.max(3, mealsPerDay - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-lg font-bold flex items-center justify-center transition-colors">−</button>
                    <span className="text-2xl font-bold w-8 text-center">{mealsPerDay}</span>
                    <button onClick={() => setMealsPerDay(Math.min(8, mealsPerDay + 1))}
                      className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-lg font-bold flex items-center justify-center transition-colors">+</button>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-700 hidden sm:block" />
                <Toggle on={linkedMacros} onToggle={() => setLinkedMacros(!linkedMacros)} label="Zelfde macro's voor alle dagen" />
              </div>
            </div>

            {/* Macro targets */}
            <div className={`grid ${linkedMacros ? 'grid-cols-1 max-w-lg' : 'md:grid-cols-2'} gap-4`}>
              {linkedMacros ? (
                <MacroCardGroup type="training" label="Alle dagen" icon={Calendar} color="text-purple-400" />
              ) : (
                <>
                  <MacroCardGroup type="training" label="Trainingsdag" icon={Dumbbell} color="text-orange-400" />
                  <MacroCardGroup type="rest" label="Rustdag" icon={Sofa} color="text-green-400" />
                </>
              )}
            </div>

            {/* Weekschema */}
            <div className="bg-slate-800/60 backdrop-blur rounded-xl p-5 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Weekschema</h2>
                <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded-full">
                  {trainingDayCount} training · {7 - trainingDayCount} rust
                </span>
              </div>

              <div className="space-y-2">
                {DAYS.map((day, idx) => {
                  const cfg = dayConfigs[idx];
                  const macros = getMacrosForDay(idx);
                  return (
                    <div key={idx} className={`rounded-xl border transition-all ${
                      cfg.isTraining ? 'border-orange-500/20 bg-orange-500/5' : 'border-green-500/15 bg-green-500/5'
                    }`}>
                      <div className="flex items-center gap-3 px-4 py-2.5">
                        <span className="font-semibold text-sm w-24">{day}</span>
                        <button onClick={() => toggleTraining(idx)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            cfg.isTraining ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}>
                          {cfg.isTraining ? <Dumbbell size={12} /> : <Sofa size={12} />}
                          {cfg.isTraining ? 'Training' : 'Rust'}
                        </button>
                        <div className="flex-1" />
                        <span className="text-xs text-slate-500 hidden sm:block">
                          {macros.calories} kcal · P{macros.protein} · C{macros.carbs} · F{macros.fats}
                        </span>
                        <button onClick={() => toggleCustomMacros(idx)}
                          className={`text-xs px-2 py-1 rounded-lg transition-all ${
                            cfg.useCustomMacros ? 'bg-purple-500/30 text-purple-300' : 'bg-slate-700/50 text-slate-500 hover:text-slate-300'
                          }`}>
                          {cfg.useCustomMacros ? '✦ Custom' : 'Custom'}
                        </button>
                      </div>
                      {cfg.useCustomMacros && (
                        <div className="px-4 pb-3 pt-1 border-t border-slate-700/30">
                          <div className="grid grid-cols-4 gap-2">
                            {(Object.keys(MACRO_LABELS_SHORT) as MacroField[]).map(f => (
                              <MacroInputField key={f} label={MACRO_LABELS_SHORT[f]} value={cfg.customMacros[f]}
                                onChange={(val) => updateCustomMacro(idx, f, val)} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== INGREDIENTS ===== */}
        {activeTab === 'ingredients' && (
          <div className="space-y-5">
            {/* Add form */}
            <div className="bg-slate-800/60 backdrop-blur rounded-xl p-5 border border-slate-700/50">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Nieuw ingredient</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input type="text" placeholder="Naam" value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  className="bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none px-3 py-2 rounded-lg text-sm col-span-2 transition-colors" />
                <select value={newIngredient.category}
                  onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value as Category })}
                  className="bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg text-sm">
                  {(['Protein', 'Carbs', 'Fats', 'Veggies', 'Fruit'] as Category[]).map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={newIngredient.unit}
                  onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                  className="bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg text-sm">
                  {['gr', 'ml', 'stuk'].map(u => <option key={u}>{u}</option>)}
                </select>
                {(['calories', 'protein', 'carbs', 'fats'] as MacroField[]).map(f => (
                  <input key={f} type="number" placeholder={MACRO_LABELS_SHORT[f]}
                    value={newIngredient[f] || ''}
                    onChange={(e) => setNewIngredient({ ...newIngredient, [f]: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none px-3 py-2 rounded-lg text-sm transition-colors" />
                ))}
              </div>
              <button onClick={addIngredient}
                className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors">
                <Plus size={14} /> Toevoegen
              </button>
            </div>

            {/* List */}
            <div className="bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
              {(['Protein', 'Carbs', 'Fats', 'Veggies', 'Fruit'] as Category[]).map(cat => {
                const items = favoriteIngredients.filter(x => x.category === cat);
                if (items.length === 0) return null;
                const open = expandedIngCat === cat;
                const catColors: Record<Category, string> = { Protein: 'text-red-400', Carbs: 'text-blue-400', Fats: 'text-yellow-400', Veggies: 'text-green-400', Fruit: 'text-pink-400' };
                return (
                  <div key={cat} className="border-b border-slate-700/50 last:border-0">
                    <button onClick={() => setExpandedIngCat(open ? null : cat)}
                      className="flex items-center justify-between w-full px-5 py-3 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${catColors[cat]}`}>{cat}</span>
                        <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">{items.length}</span>
                      </div>
                      {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                    </button>
                    {open && (
                      <div className="px-5 pb-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map((ing, idx) => (
                          <div key={idx} className="bg-slate-700/50 rounded-lg p-3 flex justify-between items-start group">
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">{ing.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {ing.calories} cal · P:{ing.protein} · C:{ing.carbs} · F:{ing.fats} / 100{ing.unit === 'stuk' ? ' stuk' : ing.unit}
                              </div>
                            </div>
                            <button onClick={() => setFavoriteIngredients(favoriteIngredients.filter((_, i) => i !== favoriteIngredients.indexOf(ing)))}
                              className="text-red-400/50 hover:text-red-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== PLANNER ===== */}
        {activeTab === 'planner' && (
          <div className="space-y-4">
            {/* Day selector strip */}
            <div className="bg-slate-800/60 backdrop-blur rounded-xl p-2 border border-slate-700/50 flex gap-1.5">
              {DAYS.map((_, idx) => {
                const cfg = dayConfigs[idx];
                const hasPlan = (mealPlans[idx] || []).length > 0;
                const sel = selectedDay === idx;
                return (
                  <button key={idx} onClick={() => setSelectedDay(idx)}
                    className={`flex-1 py-2 rounded-lg text-center transition-all relative ${
                      sel
                        ? cfg.isTraining ? 'bg-orange-500 text-white shadow-md' : 'bg-green-600 text-white shadow-md'
                        : 'text-slate-400 hover:bg-slate-700/50'
                    }`}>
                    <div className="text-xs font-bold">{DAYS_SHORT[idx]}</div>
                    <div className="mt-0.5">
                      {cfg.isTraining ? <Dumbbell size={10} className="mx-auto" /> : <Sofa size={10} className="mx-auto" />}
                    </div>
                    {hasPlan && !sel && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full" />}
                  </button>
                );
              })}
            </div>

            {/* Day actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {dayConfig.isTraining ? <Dumbbell size={16} className="text-orange-400" /> : <Sofa size={16} className="text-green-400" />}
                <h3 className="font-bold">{DAYS[selectedDay]}</h3>
                <span className="text-xs text-slate-500">
                  {dayConfig.isTraining ? 'Training' : 'Rust'}
                  {dayConfig.useCustomMacros && ' · Custom'}
                </span>
              </div>
              <div className="flex gap-2">
                <select onChange={(e) => { if (e.target.value !== '') { copyPlan(parseInt(e.target.value), selectedDay); e.target.value = ''; } }}
                  className="bg-slate-700 border border-slate-600 text-xs px-2 py-1.5 rounded-lg text-slate-400">
                  <option value="">Kopieer van…</option>
                  {DAYS.map((d, i) => i !== selectedDay && (mealPlans[i] || []).length > 0 ? <option key={i} value={i}>{d}</option> : null)}
                </select>
                <button onClick={() => generatePlan(selectedDay)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-sm font-semibold shadow-md transition-all">
                  <Sparkles size={14} /> Genereer
                </button>
              </div>
            </div>

            {/* Macro summary */}
            {currentTotals && (
              <div className="bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-slate-700/50 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MacroBar label="Calorieën" value={currentTotals.calories} target={targetMacros.calories} color="#facc15" />
                <MacroBar label="Eiwit" value={currentTotals.protein} target={targetMacros.protein} color="#f87171" />
                <MacroBar label="Koolhydraten" value={currentTotals.carbs} target={targetMacros.carbs} color="#60a5fa" />
                <MacroBar label="Vetten" value={currentTotals.fats} target={targetMacros.fats} color="#4ade80" />
              </div>
            )}

            {/* Meals */}
            {currentMeals.length === 0 ? (
              <div className="bg-slate-800/40 rounded-xl p-12 text-center border border-dashed border-slate-700">
                <Sparkles size={32} className="mx-auto mb-3 text-purple-400/40" />
                <p className="text-slate-500 text-sm">Klik 'Genereer' om een plan voor {DAYS[selectedDay]} te maken</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentMeals.map(meal => (
                  <div key={meal.id} className="bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-700/30 bg-slate-700/20">
                      <h3 className="font-bold text-sm text-cyan-400">{meal.name}</h3>
                    </div>
                    <div className="p-3 space-y-1.5">
                      {meal.foods.map((food, idx) => {
                        const m = food.unit === 'stuk' ? food.quantity : food.quantity / 100;
                        return (
                          <div key={idx} className="flex items-center gap-2 bg-slate-700/30 rounded-lg px-3 py-2 group">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium">{food.name}</span>
                              <span className="text-xs text-slate-500 ml-2">
                                {(food.calories * m).toFixed(0)} · P:{(food.protein * m).toFixed(1)} · C:{(food.carbs * m).toFixed(1)} · F:{(food.fats * m).toFixed(1)}
                              </span>
                            </div>
                            <input type="number" value={food.quantity}
                              onChange={(e) => updateFoodQty(selectedDay, meal.id, idx, e.target.value)}
                              className="bg-slate-600 border border-slate-500 focus:border-blue-500 focus:outline-none px-2 py-1 rounded w-14 text-center text-xs transition-colors" />
                            <span className="text-xs text-slate-500 w-6">{food.unit}</span>
                            <button onClick={() => removeFoodFromMeal(selectedDay, meal.id, idx)}
                              className="text-red-400/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="px-3 pb-3">
                      <select onChange={(e) => {
                        if (e.target.value) {
                          const ing = favoriteIngredients.find(i => i.name === e.target.value);
                          if (ing) { addFoodToMeal(selectedDay, meal.id, ing); e.target.value = ''; }
                        }
                      }} className="w-full bg-slate-700/30 border border-dashed border-slate-600 text-slate-500 px-3 py-1.5 rounded-lg text-xs hover:border-slate-500 transition-colors">
                        <option value="">+ Ingredient toevoegen</option>
                        {favoriteIngredients.map((ing, idx) => <option key={idx} value={ing.name}>{ing.name} ({ing.category})</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== GROCERY ===== */}
        {activeTab === 'grocery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Weekoverzicht Boodschappen</h2>
              {Object.keys(mealPlans).length > 0 && (
                <span className="text-xs text-slate-500">{Object.keys(mealPlans).map(i => DAYS_SHORT[parseInt(i)]).join(', ')}</span>
              )}
            </div>

            {Object.keys(mealPlans).length === 0 ? (
              <div className="bg-slate-800/40 rounded-xl p-12 text-center border border-dashed border-slate-700">
                <ShoppingCart size={32} className="mx-auto mb-3 text-slate-600" />
                <p className="text-slate-500 text-sm">Genereer eerst meal plans om een boodschappenlijst te zien</p>
              </div>
            ) : (
              <div className="bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
                {groceryList().map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded accent-cyan-500 flex-shrink-0" />
                    <span className="flex-1 text-sm">{item.name}</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {item.unit === 'stuk' ? `${item.quantity}×` : `${item.quantity.toFixed(0)} ${item.unit}`}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FitnessMealPlanner;
