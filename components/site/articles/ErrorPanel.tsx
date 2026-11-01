import { AlertCircle } from "lucide-react";
import { IconTile } from "@/components/site/primitives";

/** Mist band with a white card, used by the blog error boundaries. */
export default function ErrorPanel({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-mist text-ink">
      <div className="mx-auto flex min-h-[60vh] w-full max-w-[1440px] items-center justify-center px-gutter py-14 md:py-20">
        <div className="flex w-full max-w-[520px] flex-col items-center gap-4 rounded-[22px] border border-line bg-white p-7 text-center md:p-10">
          <IconTile>
            <AlertCircle className="h-6 w-6" strokeWidth={2} />
          </IconTile>
          <h1 className="text-[26px] font-extrabold leading-[1.15] md:text-[30px]">{title}</h1>
          <p className="text-base text-body">{text}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
