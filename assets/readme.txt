Hi there PowerSlicer!

=== Get started ===
1. Add a reference to EPiServer.Cms.Shell.UI.dll.
2. Create a slice by:
2.1 Creating a class inheriting ContentSliceBase<T>
2.2 Annotating it with [ServiceConfiguration(typeof(IContentQuery)), ServiceConfiguration(typeof(IContentSlice))]

=== Simple example slice ===
[ServiceConfiguration(typeof(IContentQuery)), ServiceConfiguration(typeof(IContentSlice))]
public class EverythingSlice : ContentSliceBase<IContent>
{
    public override string Name
    {
        get { return "Everything"; }
    }
}

Happy slicing!