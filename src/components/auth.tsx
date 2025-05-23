import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { supabase } from "@/lib/supabase";

const loginFormSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long").max(20, "Password must be at most 20 characters long"),
});

const signupFormSchema = z.object({
    display_name: z.string().min(3, "Display name must be at least 3 characters long").max(20, "Display name must be at most 20 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long").max(20, "Password must be at most 20 characters long"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters long").max(20, "Password must be at most 20 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
});

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });
    
    const handleSubmit = (values: z.infer<typeof loginFormSchema>) => {
        supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        }).then(({ error }) => {
            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Login successful");
                onClose();
            }
        });
    }

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen backdrop-blur-sm">
        <div className="bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-sm relative">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl">&times;</button>
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            {form.formState.errors.root && <p className="text-red-500 text-sm text-center">{form.formState.errors.root.message}</p>}
            <Form {...form}>
                <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <button type="submit" className="py-2 rounded bg-blue-600 hover:bg-blue-700 font-semibold">Login</button>
                    {form.formState.errors.root && <p className="text-red-500 text-sm text-center">{form.formState.errors.root.message}</p>}
                </form>
            </Form>
        </div>
        </div>
    );
}

export function SignupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const form = useForm<z.infer<typeof signupFormSchema>>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            display_name: "",
            email: "",
            password: "",
            confirmPassword: "",
        }
    });
    const handleSubmit = (values: z.infer<typeof signupFormSchema>) => {
        supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
                data: {
                    display_name: values.display_name,
                }
            }
        }).then(({ error }) => {
            if (error) {
                form.setError("root", { type: "server", message: error.message});
            } else {
                toast.success("Please Check your email for verification");
                onClose();
            }
        });
    }

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen backdrop-blur-sm">
        <div className="bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-sm relative">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl">&times;</button>
            <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
            
            <Form {...form}>
                <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
                    <FormField
                        control={form.control}
                        name="display_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <input
                                        type="text"
                                        placeholder="Display Name"
                                        className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <button type="submit" className="py-2 rounded bg-blue-600 hover:bg-blue-700 font-semibold">Sign Up</button>
                    {form.formState.errors.root && <p className="text-red-500 text-sm text-center">{form.formState.errors.root.message}</p>}
                </form>
            </Form>
        </div>
        </div>
    );
}
