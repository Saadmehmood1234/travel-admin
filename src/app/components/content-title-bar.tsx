import { Button } from "@/components/ui/button";
import { ContentTitleBarProps } from "@/types";
import React from "react";
const ContentTitleBar = (contentTitleBarContent:any) => {
    console.log(contentTitleBarContent,"content title")
    const { title, subTitle, buttons } = contentTitleBarContent?.contentTitleBarContent as ContentTitleBarProps;
    console.log({ title, subTitle, buttons })
    return (
        <div className="flex justify-between items-center py-2">
            <div>
                <h1 className="text-lg font-bold">{title}</h1>
                <p className="text-sm text-gray-500">{subTitle}</p>
            </div>

            <div className="flex gap-2 items-center">
                { buttons?.length && buttons.map((b, index) => (
                    <Button
                        key={index}
                        style={{
                            color: b.color || "white",
                            backgroundColor: b.bgColor || "#2563eb",
                        }}
                    >
                        {b.text}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default ContentTitleBar;
