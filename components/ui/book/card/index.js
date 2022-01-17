import { useEthPrice } from "@components/hooks/useEthPrice";
import Image from "next/image";
import Link from "next/link";
import { Loader } from "@components/ui/common";

import { AnimateKeyframes } from "react-simple-animate";

export default function Card({ book, disabled, Footer, state }) {
  const { eth } = useEthPrice(book.price);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="flex h-full">
        <div className="flex-1 h-full next-image-wrapper">
          <Image
            className={`object-cover ${disabled && "filter grayscale"}`}
            src={book.coverImage}
            layout="responsive"
            width="200"
            height="230"
            alt={book.title}
          />
        </div>
        <div className="p-8 pb-4 flex-2">
          <div className="flex items-center">
            <div className="uppercase mr-2 tracking-wide text-md text-red-500 font-semibold">
              {book.type}
            </div>
            <div>
              {state === "activated" && (
                <div className="text-xs text-black bg-green-200 p-1 px-3 rounded-full">
                  Activated
                </div>
              )}
              {state === "deactivated" && (
                <div className="text-xs text-black bg-red-200 p-1 px-3 rounded-full">
                  Deactivated
                </div>
              )}
              {state === "purchased" && (
                <AnimateKeyframes
                  play
                  duration={2}
                  keyframes={["opacity: 0.2", "opacity: 1"]}
                  iterationCount="infinite"
                >
                  <div className="text-xs text-black bg-yellow-200 p-1 px-3 rounded-full">
                    Pending
                  </div>
                </AnimateKeyframes>
              )}
            </div>
          </div>

          <Link href={`/books/${book.slug}`}>
            <a className="h-12 block mt-1 text-sm sm:text-base leading-tight font-medium text-black hover:underline">
              {book.title}
            </a>
          </Link>
          {/* <p className=" mb-2 text-red-500 text-xl  lg:text-base">
            {book.price} <span className="text-black">$</span>
          </p> */}
          <div className="flex items-center justify-center">
            {eth.data ? (
              <>
                <span className="text-2xl font-bold">{eth.itemPrice}</span>
                <Image
                  layout="fixed"
                  height="35"
                  width="35"
                  src="/small-eth.webp"
                  alt="price of book in ethereum"
                />
                <span className="text-xl font-bold">= {book.price}$</span>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <Loader size="md" />
              </div>
            )}
          </div>

          <p className="mt-2 mb-4 text-gray-500 text-sm  sm:text-base">
            {book.description.substring(0, 70)}...
          </p>
          {Footer && (
            <div className="mt-2">
              <Footer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
