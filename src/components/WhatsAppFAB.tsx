import { MessageCircle } from "lucide-react";

const WhatsAppFAB = () => {
  const handleClick = () => {
    window.open("https://wa.me/593994103005", "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-50 bg-accent text-accent-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={26} />
    </button>
  );
};

export default WhatsAppFAB;
