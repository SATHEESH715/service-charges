namespace SampleApi.Tests;

[TestClass]
public class StripeDataTests
{
    [TestMethod]
    public void GetAll_ReturnsThreeItems() =>
        Assert.AreEqual(3, StripeData.GetAll().Count);

    [TestMethod]
    public void GetAll_HasUniqueNumbers() =>
        Assert.AreEqual(3, StripeData.GetAll().Select(i => i.Number).Distinct().Count());

    [TestMethod]
    public void GetAll_ContainsAnEstimatedItem() =>
        Assert.IsTrue(StripeData.GetAll().Any(i => i.Status == "Estimated"));
}
