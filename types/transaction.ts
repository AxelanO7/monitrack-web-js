export interface Transaction {
  id: string;
  user: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  note: string;
  createdAt: string;
}
