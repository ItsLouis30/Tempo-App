import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-[#4D4D4D] flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="bg-[#2B2B2B] text-white shadow-2xl border-none">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Gracias por registrarte!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white opacity-80">
                Tu cuenta se creó correctamente. Ahora ya puedes{" "}
                <Link
                  href="/auth/login"
                  className="underline hover:text-blue-400 transition-colors"
                >
                  iniciar sesión
                </Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
