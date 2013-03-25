using EPiServer.Core;

namespace PowerSlice
{
    public class CreateOption
    {
        public CreateOption(string label, ContentReference parent, int contentTypeId)
        {
            Label = label;
            Parent = parent;
            ContentTypeId = contentTypeId;
        }

        public string Label { get; private set; }
        public ContentReference Parent { get; private set; }
        public int ContentTypeId { get; private set; }
    }
}