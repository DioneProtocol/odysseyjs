import { PubSub } from "../../src"

const main = async (): Promise<any> => {
  const pubsub: PubSub = new PubSub()
  const newBloom: string = pubsub.newBloom()
  console.log(newBloom)
}

main()
