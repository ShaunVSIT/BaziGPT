import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FamousPerson } from "@/types/famous";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fallbackImg = "/default-portrait.png";

const FamousPersonCard: React.FC<{ person: FamousPerson }> = ({ person }) => {
  const { t } = useTranslation();

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/60 bg-card/70 py-0 transition-colors hover:border-primary/40">
      <div
        className="relative h-48 w-full border-b border-border/60 bg-muted"
        style={{
          backgroundImage: "url(/Honeycomb_texture.svg)",
          backgroundRepeat: "repeat",
          backgroundSize: "cover",
        }}
      >
        <img
          src={person.image_url || fallbackImg}
          alt={person.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImg;
          }}
        />
      </div>

      <CardContent className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {person.name}
        </h3>
        {person.category && (
          <div className="mt-1">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/15"
            >
              {person.category}
            </Badge>
          </div>
        )}
        <p className="mt-2 mb-3 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {person.bio}
        </p>
        <Button asChild className="w-full font-semibold">
          <Link to={`/famous/${person.slug}`}>{t("famous.viewChart")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default FamousPersonCard;
