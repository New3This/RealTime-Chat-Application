
import showcase from "../assets/showcase.png";
import { useState, useEffect } from "react";

function Home() {
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === "Escape") {
                setPreviewOpen(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="min-h-[calc(100dvh-63px)] bg-amber-100 flex lg:items-center flex-col p-20">

            <div className="w-full bg-amber-100 flex flex-col gap-10 py-10 px-0 min-[1400px]:px-5 min-[1450px]:px-10 min-[1500px]:px-20 min-[1300px]:flex-row lg:items-stretch lg:gap-10">

                <div className="flex flex-col gap-5 lg:flex-[0.8] items-start p-10">

                    <div className="font-semibold text-wrap text-2xl leading-[1.1] tracking-[-0.03em] md:text-3xl lg:text-5xl">
                        Explore the World
                    </div>

                    <div className="leading-[1.4] tracking-[-0.03em] text-base md:text-xl lg:text-[27px]">
                        Experience the globe in one place, through the people of Realtime Chat. Send reactions, pictures and messages, with chat notifications helping you stay in the loop.
                    </div>

                    <div className="flex flex-row flex-wrap gap-2">

                        <button className="bg-white p-3 border border-black/50 rounded-lg font-bold text-xs md:text-[15px]">
                            Begin A Conversation
                        </button>

                        <button className="bg-black p-3 border rounded-lg text-white font-bold text-xs md:text-[15px]">
                            I already have an account
                        </button>

                    </div>

                    <div className="flex flex-row gap-2 items-center">

                        <div className="flex shrink-0">

                            <div className="bg-red-500 rounded-full w-10 h-10 text-center border-red-500 border-2 flex items-center justify-center">
                                D
                            </div>

                            <div className="bg-yellow-500 rounded-full w-10 h-10 text-center -ml-2 border-white border-2 flex items-center justify-center">
                                C
                            </div>

                            <div className="bg-green-500 rounded-full w-10 h-10 text-center -ml-2 border-white border-2 flex items-center justify-center">
                                S
                            </div>

                        </div>

                        <div className="text-gray-500 text-sm italic font-light">
                            We're all one message away from each other.
                        </div>

                    </div>

                </div>

                <div className="flex-1 border-black border-radius rounded-lg shadow-2xl flex items-center justify-center min-[1300px]:px-6 bg-linear-to-br from-amber-100 via-amber-150 to-amber-300 ">

                    <img src={showcase} alt="Realtime Chat application preview" onClick={() => setPreviewOpen(true)} className="block w-full h-auto cursor-zoom-in rounded-lg"/>

                </div>

            </div>


                    <div className="mt-25 grid gap-5 md:grid-cols-3">
                        <div className="rounded-2xl p-5 mx-20 text-center items-center justify-center">
                            <div className="flex size-12 items-center justify-center text-2xl w-full font-bold" aria-hidden="true">&#128241;Talk in real time</div>
                            <p className="mt-2 leading-7 text-gray-600">Keep up with the conversation as messages arrive, without missing a beat.</p>
                        </div>
                        <div className="rounded-2xl p-5 mx-20 text-center items-center justify-center">
                            <div className="flex size-12 items-center justify-center text-2xl w-full font-bold" aria-hidden="true">🌟Share the moment</div>
                            <p className="mt-2 leading-7 text-gray-600">Send pictures and reactions to make each exchange feel more personal.</p>
                        </div>
                        <div className="rounded-2xl p-5 mx-20 text-center items-center justify-center">
                            <div className="flex size-12 items-center justify-center text-2xl w-full font-bold" aria-hidden="true">🔔Stay in the loop</div>
                            <p className="mt-2 leading-7 text-gray-600">Chat notifications help you know when there's something new to catch up on.</p>
                        </div>
                    </div>

            {previewOpen && (
                <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={() => setPreviewOpen(false)}>

                    <button onClick={() => setPreviewOpen(false)} className="absolute top-5 right-6 text-white text-4xl hover:text-gray-300" aria-label="Close image preview">
                        &times;
                    </button>

                    <img src={showcase} alt="Realtime Chat application enlarged preview" className="max-h-[90vh] rounded-lg cursor-zoom-out"/>

                </div>
            )}

        </div>
    );
}

export default Home;
