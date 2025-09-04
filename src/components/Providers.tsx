"use client";

import {
  BorderStyle,
  ChartMode,
  ChartVariant,
  DataThemeProvider,
  IconProvider,
  LayoutProvider,
  NeutralColor,
  ScalingSize,
  Schemes,
  SolidStyle,
  SolidType,
  SurfaceStyle,
  ThemeProvider,
  ToastProvider,
  TransitionStyle,
} from "@once-ui-system/core";
import { SessionProvider } from "next-auth/react";
import { style, dataStyle } from "../resources";
import { iconLibrary } from "../resources/icons";
import { Toaster } from "./ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <LayoutProvider>
        <ThemeProvider
          brand={style.brand as Schemes}
          accent={style.accent as Schemes}
          neutral={style.neutral as NeutralColor}
          solid={style.solid as SolidType}
          solidStyle={style.solidStyle as SolidStyle}
          border={style.border as BorderStyle}
          surface={style.surface as SurfaceStyle}
          transition={style.transition as TransitionStyle}
          scaling={style.scaling as ScalingSize}
        >
          <DataThemeProvider
            variant={dataStyle.variant as ChartVariant}
            mode={dataStyle.mode as ChartMode}
            height={dataStyle.height}
            axis={{
              stroke: dataStyle.axis.stroke,
            }}
            tick={{
              fill: dataStyle.tick.fill,
              fontSize: dataStyle.tick.fontSize,
              line: dataStyle.tick.line,
            }}
          >
            <ToastProvider>
              <IconProvider icons={iconLibrary}>
                {children}
                <Toaster />
              </IconProvider>
            </ToastProvider>
          </DataThemeProvider>
        </ThemeProvider>
      </LayoutProvider>
    </SessionProvider>
  );
}
