import { Suspense } from "react";
import BookNow from "../../Components/BookNow";
import LoadingScreen from "../../Components/LoadingScreen";

export const metadata = {
    title: "Book Now | Emenac Travel",
    robots: "noindex, nofollow",
};

export default function BookNowPage() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <BookNow />
        </Suspense>
    );
}
