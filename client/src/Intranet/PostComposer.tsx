import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Image,
    Link2,
    AtSign,
    Hash,
    Globe,
    Building2,
    Smile,
    Send,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PostComposerProps {
    onPost?: (content: string, visibility: string, departmentId?: string) => void;
    isPosting?: boolean;
    departments?: { id: string; name: string; color?: string }[];
}

export function PostComposer({ onPost, isPosting = false, departments = [] }: PostComposerProps) {
    const [content, setContent] = useState("");
    const [visibility, setVisibility] = useState<"public" | "department">("public");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [isFocused, setIsFocused] = useState(false);
    const { user } = useAuth();

    const handlePost = () => {
        if (!content.trim()) return;
        onPost?.(content, visibility, visibility === "department" ? selectedDepartment : undefined);
        setContent("");
        setIsFocused(false);
    };

    return (
        <div className={cn(
            "bg-white/80 dark:bg-card/80 backdrop-blur-md rounded-3xl border border-border/50 transition-all duration-300",
            isFocused && "border-primary/30 shadow-lg shadow-primary/5"
        )}>
            <div className="p-4">
                {/* Header with avatar and input */}
                <div className="flex gap-3">
                    <Avatar className="h-10 w-10 border border-border/50 shrink-0">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {(user?.username || "U").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <Textarea
                            placeholder="What's happening at your department?"
                            className={cn(
                                "min-h-[60px] resize-none border-0 bg-transparent p-0 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0",
                                isFocused && "min-h-[100px]"
                            )}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                        />
                    </div>
                </div>

                {/* Action bar - shown when focused or has content */}
                {(isFocused || content) && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                        <div className="flex items-center justify-between gap-4">
                            {/* Left side - attachment buttons */}
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                    <Image className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                    <Link2 className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                    <AtSign className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                    <Hash className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                    <Smile className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Right side - visibility and post button */}
                            <div className="flex items-center gap-3">
                                <Select
                                    value={visibility}
                                    onValueChange={(v: "public" | "department") => setVisibility(v)}
                                >
                                    <SelectTrigger className="w-[140px] h-9 rounded-xl border-border/50 bg-secondary/30">
                                        <SelectValue>
                                            <div className="flex items-center gap-2">
                                                {visibility === "public" ? (
                                                    <>
                                                        <Globe className="w-4 h-4" />
                                                        <span>Everyone</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Building2 className="w-4 h-4" />
                                                        <span>Department</span>
                                                    </>
                                                )}
                                            </div>
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="public" className="rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4" />
                                                <span>Everyone</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="department" className="rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                <span>Department Only</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {visibility === "department" && departments.length > 0 && (
                                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                        <SelectTrigger className="w-[140px] h-9 rounded-xl border-border/50 bg-secondary/30">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id} className="rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: dept.color || '#7c3aed' }}
                                                        />
                                                        <span>{dept.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                <Button
                                    onClick={handlePost}
                                    disabled={!content.trim() || isPosting}
                                    className="h-9 px-5 rounded-xl shadow-sm font-bold"
                                >
                                    {isPosting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Post
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
