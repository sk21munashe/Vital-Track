import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Loader2,
  Sparkles,
  DollarSign,
  Lightbulb,
  RefreshCw,
  Printer,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserPlan } from '@/contexts/UserPlanContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GroceryItem {
  name: string;
  quantity: string;
  notes?: string;
  checked?: boolean;
}

interface GroceryCategory {
  name: string;
  icon: string;
  items: GroceryItem[];
}

interface GroceryListData {
  categories: GroceryCategory[];
  estimatedCost: string;
  shoppingTips: string[];
}

export function GroceryList() {
  const { healthPlan, healthProfile } = useUserPlan();
  const [groceryData, setGroceryData] = useState<GroceryListData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const generateGroceryList = async () => {
    if (!healthPlan || !healthProfile) {
      toast.error('No meal plan found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-grocery-list`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            weeklyPlan: healthPlan.weeklyPlan,
            dietPreference: healthProfile.dietPreference,
            servings: 1,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate grocery list');
      }

      const data = await response.json();
      setGroceryData(data);
      // Expand all categories by default
      setExpandedCategories(new Set(data.categories.map((c: GroceryCategory) => c.name)));
      setCheckedItems(new Set());
      toast.success('Grocery list generated!');
    } catch (error) {
      console.error('Error generating grocery list:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate grocery list');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const toggleItem = (itemKey: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  };

  const handlePrint = () => {
    if (!groceryData) return;
    
    const printContent = groceryData.categories.map(cat => 
      `${cat.icon} ${cat.name}\n${cat.items.map(item => 
        `  ${checkedItems.has(`${cat.name}-${item.name}`) ? '✓' : '○'} ${item.name} - ${item.quantity}${item.notes ? ` (${item.notes})` : ''}`
      ).join('\n')}`
    ).join('\n\n');
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Grocery List</title></head>
          <body style="font-family: system-ui; padding: 20px; white-space: pre-wrap;">
            <h1>Weekly Grocery List</h1>
            <p style="color: #666;">Estimated cost: ${groceryData.estimatedCost}</p>
            <hr/>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    if (!groceryData) return;
    
    const content = groceryData.categories.map(cat => 
      `${cat.icon} ${cat.name}\n${cat.items.map(item => 
        `  • ${item.name} - ${item.quantity}${item.notes ? ` (${item.notes})` : ''}`
      ).join('\n')}`
    ).join('\n\n');
    
    const blob = new Blob([
      `WEEKLY GROCERY LIST\n`,
      `Estimated cost: ${groceryData.estimatedCost}\n`,
      `${'='.repeat(40)}\n\n`,
      content,
      `\n\n${'='.repeat(40)}\n`,
      `SHOPPING TIPS:\n`,
      groceryData.shoppingTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const completedCount = checkedItems.size;
  const totalCount = groceryData?.categories.reduce((sum, cat) => sum + cat.items.length, 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
          onClick={() => {
            setIsOpen(true);
            if (!groceryData) {
              generateGroceryList();
            }
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          Grocery List
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-500" />
              Weekly Grocery List
            </DialogTitle>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handlePrint}
                disabled={!groceryData}
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleDownload}
                disabled={!groceryData}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={generateGroceryList}
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
          
          {groceryData && (
            <div className="flex items-center justify-between text-sm mt-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>{groceryData.estimatedCost}</span>
              </div>
              <div className="text-muted-foreground">
                {completedCount}/{totalCount} items
              </div>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating your grocery list...</p>
            </div>
          ) : groceryData ? (
            <div className="p-4 space-y-3">
              {groceryData.categories.map((category) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-xl overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full p-3 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-sm">{category.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({category.items.filter(item => checkedItems.has(`${category.name}-${item.name}`)).length}/{category.items.length})
                      </span>
                    </div>
                    {expandedCategories.has(category.name) ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  
                  {/* Category Items */}
                  <AnimatePresence>
                    {expandedCategories.has(category.name) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-background"
                      >
                        {category.items.map((item) => {
                          const itemKey = `${category.name}-${item.name}`;
                          const isChecked = checkedItems.has(itemKey);
                          
                          return (
                            <button
                              key={item.name}
                              onClick={() => toggleItem(itemKey)}
                              className={cn(
                                "w-full p-3 flex items-center gap-3 border-t border-border/50 transition-colors text-left",
                                isChecked ? "bg-emerald-500/10" : "hover:bg-muted/30"
                              )}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                isChecked 
                                  ? "bg-emerald-500 border-emerald-500" 
                                  : "border-muted-foreground/50"
                              )}>
                                {isChecked && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm font-medium truncate",
                                  isChecked && "line-through text-muted-foreground"
                                )}>
                                  {item.name}
                                </p>
                                {item.notes && (
                                  <p className="text-xs text-muted-foreground truncate">{item.notes}</p>
                                )}
                              </div>
                              <span className={cn(
                                "text-sm text-muted-foreground flex-shrink-0",
                                isChecked && "line-through"
                              )}>
                                {item.quantity}
                              </span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
              
              {/* Shopping Tips */}
              {groceryData.shoppingTips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <h4 className="font-medium text-sm">Shopping Tips</h4>
                  </div>
                  <ul className="space-y-1">
                    {groceryData.shoppingTips.map((tip, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Sparkles className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground text-center">
                Click refresh to generate your<br />personalized grocery list
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
