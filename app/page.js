import HeroPart from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData, howto } from "@/data/landing";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mt-40 bg-gray-50">
      <HeroPart></HeroPart>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-12">Everything You Need to Take Control of Your Money</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((features,index)=>(
            <Card key={index} className="p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="space-y-4 pt-4">
                  {features.icon}
                  <h3 className="text-xl font-semibold">{features.title}</h3>
                  <p className="text-gray-600">{features.description}</p>
              </CardContent>
            </Card>
          ))}
          </div> 
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b bg-gray-50 p-5">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center pb-6">How It Works</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch">
              {howto.map((how,index1)=>(
                <div key={index1} className="p-6 flex flex-col items-center text-center rounded-2xl shadow-lg bg-white hover:shadow-2xl transition-shadow duration-300">
                  {how.icon}
                  <h1 className="pt-2 text-2xl font-semibold ">{how.title}</h1>
                  <p className="pt-4 text-m text-gray-600">{how.description}</p>
                </div>
              ))}
            </div>
          </div>
      </section>

      <section className="py-20">
        <div className="items-center text-center container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Let&apos;s Get Started</h2>
        <p className="mb-6 text-gray-600">
          Your journey with Finix begins with one click.
        </p>
          <Link href="/dashboard">
              <Button size="lg" className="bg-[#06b6d4] text-white hover:bg-[#0891b2] transition-transform duration-200 hover:scale-105">
                Click To Start
              </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}