"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MonacoEditorClient } from "@/components/MonacoEditorClient";

export default function ThemePage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Theme</h1>
      <div className="mb-4">
        <ThemeToggle />
      </div>
      <div className="rounded border p-6">
        <div className="mb-2 text-sm text-muted-foreground">Live preview</div>
        <div className="grid gap-6">
          {/* Colors and badges */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded border p-3">
              <div className="mb-2 text-xs text-muted-foreground">Primary</div>
              <div className="rounded bg-primary p-3 text-primary-foreground">
                Primary
              </div>
            </div>
            <div className="rounded border p-3">
              <div className="mb-2 text-xs text-muted-foreground">
                Secondary
              </div>
              <div className="rounded bg-secondary p-3 text-secondary-foreground">
                Secondary
              </div>
            </div>
            <div className="rounded border p-3">
              <div className="mb-2 text-xs text-muted-foreground">Accent</div>
              <div className="rounded bg-accent p-3 text-accent-foreground">
                Accent
              </div>
            </div>
            <div className="rounded border p-3">
              <div className="mb-2 text-xs text-muted-foreground">Muted</div>
              <div className="rounded bg-muted p-3 text-muted-foreground">
                Muted
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div>
            <h2 className="mb-2 text-lg font-medium">Buttons</h2>
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          {/* Inputs */}
          <div>
            <h2 className="mb-2 text-lg font-medium">Inputs</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Type here" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one">Option one</SelectItem>
                  <SelectItem value="two">Option two</SelectItem>
                  <SelectItem value="three">Option three</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                className="md:col-span-2"
                placeholder="Textarea example"
              />
            </div>
          </div>

          {/* Toggles */}
          <div>
            <h2 className="mb-2 text-lg font-medium">Toggles</h2>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch id="switch-demo" />
                <label
                  htmlFor="switch-demo"
                  className="text-sm text-muted-foreground"
                >
                  Switch
                </label>
              </div>
              <div className="w-48">
                <Slider defaultValue={[50]} />
              </div>
              <div className="w-48">
                <Progress value={66} />
              </div>
            </div>
          </div>

          {/* Tabs and Card */}
          <div className="grid gap-4 md:grid-cols-2">
            <Tabs defaultValue="account">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>
              <TabsContent
                value="account"
                className="rounded border p-4 text-sm text-muted-foreground"
              >
                Account content goes here.
              </TabsContent>
              <TabsContent
                value="profile"
                className="rounded border p-4 text-sm text-muted-foreground"
              >
                Profile content goes here.
              </TabsContent>
            </Tabs>
            <Card>
              <CardHeader>
                <CardTitle>Card title</CardTitle>
                <CardDescription>Card description</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is a simple card using theme tokens.
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge>Badge</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Action
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Alert */}
          <Alert>
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>
              This is an alert demonstrating contrast and background.
            </AlertDescription>
          </Alert>

          {/* Tooltip */}
          <TooltipProvider>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline">
                    Hover me
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tooltip content</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Glass panel & Editor */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass-panel rounded p-4">
              <h3 className="mb-1 font-medium">Glass panel</h3>
              <p className="text-sm text-muted-foreground">
                This panel uses the glass styles and should adapt across themes.
              </p>
            </div>
            <div>
              <MonacoEditorClient
                height="240px"
                value={`{\n  \"preview\": true,\n  \"theme\": \"adaptive\"\n}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
