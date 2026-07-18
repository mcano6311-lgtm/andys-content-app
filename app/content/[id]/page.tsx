import { ContentItemDetail } from "@/components/content/content-item-detail"

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ContentItemDetail id={id} />
}
