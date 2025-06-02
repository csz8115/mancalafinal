import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateGameComponent from './createGame';
import JoinGameComponent from './joinGame';

export default function Page() {

    return (
        <div className="container mx-auto p-8 flex justify-center">
            <Tabs defaultValue="create" className="w-full max-w-2xl">
                <TabsList className="flex space-x-2">
                    <TabsTrigger value="create">Create Game</TabsTrigger>
                    <TabsTrigger value="join">Join Game</TabsTrigger>
                </TabsList>
                <TabsContent value="create">
                    <CreateGameComponent />
                </TabsContent>
                <TabsContent value="join">
                    <JoinGameComponent />
                </TabsContent>
            </Tabs>
        </div>
    );
}