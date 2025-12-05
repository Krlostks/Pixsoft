"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import ReactMarkdown from "react-markdown";

export function ChatFloating() {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", message: "Inicia sesión para chatear." }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const userToken = Cookies.get("token");
    setToken(userToken);
  }, []);

  // Cargar historial al abrir chat
  useEffect(() => {
    if (chatOpen && token) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/agente/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then(res => setMessages(res.data.messages))
        .catch(err => console.error("Error al obtener los mensajes:", err));
    }
  }, [chatOpen, token]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);

    setMessages(prev => [
      ...prev,
      { role: "user", message: input }
    ]);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/agente/message`,
        { message: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const cleanBotMsg = (msg: string) =>
        msg.replace(/\s?\[[^\]]*\]/g, "").replace(/\s{2,}/g, " ").trim();

      const botMsgRaw =
        res.data?.result?.choices?.[0]?.message?.content ||
        res.data?.result?.result ||
        "No se obtuvo respuesta";

      const botMsg = cleanBotMsg(botMsgRaw);


      setMessages(prev => [
        ...prev,
        { role: "bot", message: botMsg }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "bot",
          message:
            "Ups, hubo un problema con el asistente. Inténtalo de nuevo en unos segundos.",
        },
      ]);
    }
    setInput("");
    setLoading(false);
  };


  return (
    <>
      {!chatOpen && (
        <Button
          variant="default"
          onClick={() => setChatOpen(true)}
          className="fixed bottom-8 bg-cyan-500 hover:bg-cyan-600 right-8 rounded-full p-0 w-14 h-14 shadow-xl flex items-center justify-center animate-in fade-in transition-all z-50"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-7 h-7" />
        </Button>
      )}

      {chatOpen && (
        <div className="fixed bottom-9 right-8 w-[360px] max-w-[90vw] animate-in slide-in-from-bottom-6 fade-in duration-300 z-50">
          <Card className="rounded-2xl shadow-2xl flex flex-col p-0 min-h-[520px] max-h-[90dvh]">
            <CardHeader className="flex flex-row items-center justify-between px-5 py-3 rounded-t-xl bg-muted">
              <div className="flex flex-col">
                <CardTitle className="text-xl font-bold select-none flex items-center gap-2">
                  Pixie
                </CardTitle>
                <CardDescription>
                  Soy tu asistente virtual, puedes pedirme ayuda sobre nuestros productos y servicios.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setChatOpen(false)}
                aria-label="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 p-0 max-h-[50vh]">
              <div
                ref={messagesRef}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-linear-to-b from-background to-muted"
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[78%] px-4 py-2 text-base rounded-2xl shadow-sm break-words
                      ${
                        msg.role === "bot"
                          ? "bg-blue-50 text-blue-950 dark:bg-blue-950 dark:text-blue-200 rounded-bl-none"
                          : "bg-cyan-600 text-primary-foreground dark:bg-cyan-900 rounded-br-none ml-auto"
                      }`}
                  >
                    {msg.role === "bot" ? (
                      <ReactMarkdown>{msg.message}</ReactMarkdown>
                    ) : (
                      msg.message
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="max-w-[78%] px-4 py-2 text-base rounded-2xl shadow-sm break-words bg-blue-50 text-cyan-950 rounded-bl-none flex items-center gap-2 animate-pulse">
                    <span>Escribiendo</span>
                    <span className="flex gap-1">
                      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '100ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '200ms' }}>.</span>
                    </span>
                  </div>
                )}
              </div>
              <form
                className="flex items-end gap-2 bg-muted/70 p-3 rounded-b-xl"
                onSubmit={handleSendMessage}
              >
                <Input
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-background"
                  value={input}
                  maxLength={600}
                  onChange={e => setInput(e.target.value)}
                  autoFocus
                  disabled={loading}
                  aria-label="Escribir mensaje"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || loading}
                  className="bg-primary/90 hover:bg-primary"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}