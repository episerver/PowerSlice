namespace PowerSlice
{
    public class SortOption
    {
        public string Label { get; private set; }
        public string Key { get; private set; }
        public bool OrderDescending { get; set; }

        public SortOption(string label, string key)
        {
            Label = label;
            Key = key;
        }
    }
}