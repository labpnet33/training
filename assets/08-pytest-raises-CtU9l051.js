var e={id:`pytest-raises`,h:{en:`pytest.raises: bad input must fail in the right way`,hi:`pytest.raises: galat input sahi tareeqe se fail hona chahiye`},body:{en:`
<p><b>The idea of this chapter:</b> a good function does the right thing for good input and refuses bad input loudly. Tests for the second half use <code>pytest.raises</code>. You will test <code>vlan_range</code> with good and bad ranges (Lab 1, task 6) and learn what pytest says when the error is missing, wrong or has the wrong message.</p>

<h3>Analogy: pressing the smoke-alarm test button</h3>
<p>When you press the test button on a smoke alarm, you want it to scream. Silence is the failure. A test for bad input works the same way: calling the function with nonsense <i>must</i> raise an error. If the function quietly returns something, the test goes red.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Three outcomes of pytest.raises: right error passes, no error fails, wrong error fails">
<rect x="20" y="40" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="66" text-anchor="middle" class="svg-ink" font-size="12">with pytest.raises</text><text x="105" y="84" text-anchor="middle" class="svg-ink" font-size="12">(ValueError):</text>
<rect x="260" y="10" width="360" height="38" rx="8" fill="#bbf7d0"/><text x="440" y="34" text-anchor="middle" class="svg-ink" font-size="12">ValueError raised: test passes</text>
<rect x="260" y="56" width="360" height="38" rx="8" fill="#fecaca"/><text x="440" y="80" text-anchor="middle" class="svg-ink" font-size="12">nothing raised: Failed: DID NOT RAISE</text>
<rect x="260" y="102" width="360" height="38" rx="8" fill="#fecaca"/><text x="440" y="126" text-anchor="middle" class="svg-ink" font-size="12">another error (KeyError...): test fails with it</text>
<line x1="190" y1="70" x2="260" y2="29" stroke="#64748b" stroke-width="2"/><line x1="190" y1="70" x2="260" y2="75" stroke="#64748b" stroke-width="2"/><line x1="190" y1="70" x2="260" y2="121" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Only the exact kind of error you named is a pass.</p></div>

<h3>What vlan_range promises</h3>
<p><code>vlan_range("10-12")</code> returns <code>[10, 11, 12]</code>. Anything else that cannot be a range raises <code>ValueError</code> with a message that quotes the bad text:</p>
<pre class="out">AUTO01$ python3 -c "from netlib import vlan_range
for t in ['abc', '10', '10-', '-10', '20-10', '0-5', '4090-4095', '1000-1003']:
    try:
        vlan_range(t)
    except ValueError as e:
        print(e)"
not a range: 'abc'
not a range: '10'
not a range: '10-'
not a range: '-10'
range runs backwards: '20-10'
vlan out of range in '0-5'
vlan out of range in '4090-4095'
vlan out of range in '1000-1003'</pre>
<p>Three families of mistakes: not shaped like <code>low-high</code>, the numbers run backwards, or an end is not a valid VLAN (0, 4095 and the reserved 1003 all fail <code>valid_vlan</code>). Each message names the bad value, which is what a person reading a log needs.</p>

<h3>The tests</h3>
<p>Write <code>test_range.py</code>:</p>
<pre class="code">import pytest

from netlib import vlan_range


def test_ok():
    assert vlan_range("10-12") == [10, 11, 12]


def test_backwards():
    with pytest.raises(ValueError, match="backwards"):
        vlan_range("20-10")


def test_not_a_range():
    with pytest.raises(ValueError):
        vlan_range("abc")</pre>
<ul>
<li><code>with pytest.raises(ValueError):</code> opens a block. The call inside must raise <code>ValueError</code> (or a subclass).</li>
<li><code>match="backwards"</code> also checks the message. It is a regular expression searched inside the message text, so a word is enough.</li>
<li>The happy path <code>test_ok</code> stays: bad-input tests never replace the normal one.</li>
</ul>
<pre class="out">AUTO01$ pytest -q test_range.py
...                                                                      [100%]
<span class="hl">3 passed in 0.04s</span></pre>

<h3>What a red raises test looks like</h3>
<p>Three ways to get it wrong. Read the output: each tells you something different.</p>
<pre class="code">import pytest

from netlib import vlan_range


def test_no_error_raised():
    with pytest.raises(ValueError):
        vlan_range("10-12")


def test_wrong_type():
    with pytest.raises(KeyError):
        vlan_range("abc")


def test_match_wrong():
    with pytest.raises(ValueError, match="backwards"):
        vlan_range("abc")</pre>
<pre class="out">AUTO01$ pytest -q test_raises_fail.py
FFF                                                                      [100%]

=================================== FAILURES ===================================
_____________________________ test_no_error_raised _____________________________

    def test_no_error_raised():
        with pytest.raises(ValueError):
&gt;           vlan_range("10-12")
E           Failed: DID NOT RAISE &lt;class 'ValueError'&gt;

test_raises_fail.py:8: Failed
_______________________________ test_wrong_type ________________________________

    def test_wrong_type():
        with pytest.raises(KeyError):
&gt;           vlan_range("abc")

test_raises_fail.py:13: 
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ 

    def vlan_range(text):
        """'10-12' -&gt; [10, 11, 12]. Raises ValueError for anything that is not a sensible range."""
        low, sep, high = text.partition("-")
        if not sep or not low.isdigit() or not high.isdigit():
&gt;           raise ValueError(f"not a range: {text!r}")
E           ValueError: not a range: 'abc'

netlib.py:18: ValueError
_______________________________ test_match_wrong _______________________________

    def test_match_wrong():
        with pytest.raises(ValueError, match="backwards"):
&gt;           vlan_range("abc")
E           AssertionError: Regex pattern did not match.
E            Regex: 'backwards'
E            Input: "not a range: 'abc'"

test_raises_fail.py:18: AssertionError
=========================== short test summary info ============================
FAILED test_raises_fail.py::test_no_error_raised - Failed: DID NOT RAISE &lt;cla...
FAILED test_raises_fail.py::test_wrong_type - ValueError: not a range: 'abc'
FAILED test_raises_fail.py::test_match_wrong - AssertionError: Regex pattern ...
<span class="hl">3 failed in 0.04s</span></pre>
<ul>
<li><b>DID NOT RAISE</b>: the function accepted "10-12" quietly. Either the input is actually valid (the test is wrong) or the validation is missing (the code is wrong).</li>
<li><b>The wrong error</b>: the test expected <code>KeyError</code> but the code raised <code>ValueError</code>, and that error is shown as the failure with its own traceback.</li>
<li><b>Regex did not match</b>: the right type of error came, but the message says "not a range", not "backwards". The output prints the regex and the input side by side.</li>
</ul>

<h3>Checking the message, and a table of bad inputs</h3>
<p>To look at the error itself, capture it with <code>as</code>. Then combine <code>raises</code> with <code>parametrize</code> from Chapter 4 to cover every family of bad input:</p>
<pre class="code">import pytest

from netlib import vlan_range


def test_message():
    with pytest.raises(ValueError) as info:
        vlan_range("20-10")
    assert "backwards" in str(info.value)


@pytest.mark.parametrize("text", ["abc", "10", "10-", "-10", "20-10", "0-5", "4090-4095", "1000-1003"])
def test_bad_ranges(text):
    with pytest.raises(ValueError):
        vlan_range(text)</pre>
<pre class="out">AUTO01$ pytest -v test_bad.py
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 9 items

test_bad.py::test_message PASSED                                         [ 11%]
test_bad.py::test_bad_ranges[abc] PASSED                                 [ 22%]
test_bad.py::test_bad_ranges[10] PASSED                                  [ 33%]
test_bad.py::test_bad_ranges[10-] PASSED                                 [ 44%]
test_bad.py::test_bad_ranges[-10] PASSED                                 [ 55%]
test_bad.py::test_bad_ranges[20-10] PASSED                               [ 66%]
test_bad.py::test_bad_ranges[0-5] PASSED                                 [ 77%]
test_bad.py::test_bad_ranges[4090-4095] PASSED                           [ 88%]
test_bad.py::test_bad_ranges[1000-1003] PASSED                           [100%]

============================== 9 passed in 0.10s ===============================</pre>
<p>In the info object, <code>info.value</code> is the exception, so <code>str(info.value)</code> is its message. Prefer <code>match=</code> for a quick message check, and <code>as info</code> when you need more than one check.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting extra statements inside the <code>with</code> block after the line that should raise: they never run, because the block ends at the error. Catching <code>Exception</code> instead of the specific type, which hides the wrong error. Using <code>try/except</code> with <code>pass</code> in a test: if nothing is raised the test still passes. Treating the message as a literal when it is a regex (dots and brackets need escaping).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>pytest.raises</code> passes only if the named error is raised inside the block. No error is a failure (<code>DID NOT RAISE</code>), and so is a different error. <code>match</code> uses a regular expression search.</p></div>

<div class="scn"><h4>The range that created 4000 VLANs</h4><p>A provisioning script accepted a range typed as "10-" (the end was missing) and treated the empty end as zero, which produced a loop that tried to create thousands of VLANs. The helper had a test for "10-12" only. Adding a table of eight bad inputs with <code>pytest.raises</code> made the helper reject all of them before any switch was touched.</p><p><b>Lesson:</b> input from humans and files is wrong more often than you expect, so test the refusal as carefully as the success.</p></div>

<div class="iv"><p class="q">"How do you test that a function raises on bad input?"</p><p>With pytest.raises as a context manager: I name the specific exception, usually add match for a keyword in the message, and the test fails if nothing is raised or if another error appears. I parametrize it over a table of bad inputs and keep a separate test for the happy path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>with pytest.raises(ValueError):</code> passes only when that error occurs inside the block.</li>
<li>No error gives <code>DID NOT RAISE</code>; a different error fails the test with its traceback.</li>
<li><code>match="word"</code> checks the message with a regex search; <code>as info</code> gives <code>info.value</code>.</li>
<li>Combine <code>raises</code> with <code>parametrize</code> for a table of bad inputs.</li>
<li>Good messages quote the bad value, which helps the person reading the log.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> achha function achhe input par sahi kaam karta hai aur bure input ko zor se mana karta hai. Doosre hisse ke tests <code>pytest.raises</code> use karte hain. Aap <code>vlan_range</code> ko achhi aur buri ranges se test karoge (Lab 1, task 6) aur seekhoge ki jab error missing ho, galat ho ya message galat ho to pytest kya kehta hai.</p>

<h3>Analogy: smoke-alarm ka test button dabana</h3>
<p>Smoke alarm ka test button dabate ho to chahte ho ki woh cheekhe. Khamoshi failure hai. Bure input ka test bhi aise hi kaam karta hai: bekaar input ke saath function call karne par error <i>uthna hi chahiye</i>. Agar function chupchaap kuch return kar de, test red ho jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="pytest.raises ke teen natije: sahi error pass, koi error nahi fail, galat error fail">
<rect x="20" y="40" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="66" text-anchor="middle" class="svg-ink" font-size="12">with pytest.raises</text><text x="105" y="84" text-anchor="middle" class="svg-ink" font-size="12">(ValueError):</text>
<rect x="260" y="10" width="360" height="38" rx="8" fill="#bbf7d0"/><text x="440" y="34" text-anchor="middle" class="svg-ink" font-size="12">ValueError aaya: test pass</text>
<rect x="260" y="56" width="360" height="38" rx="8" fill="#fecaca"/><text x="440" y="80" text-anchor="middle" class="svg-ink" font-size="12">kuch nahi aaya: Failed: DID NOT RAISE</text>
<rect x="260" y="102" width="360" height="38" rx="8" fill="#fecaca"/><text x="440" y="126" text-anchor="middle" class="svg-ink" font-size="12">doosra error (KeyError...): test usi se fail</text>
<line x1="190" y1="70" x2="260" y2="29" stroke="#64748b" stroke-width="2"/><line x1="190" y1="70" x2="260" y2="75" stroke="#64748b" stroke-width="2"/><line x1="190" y1="70" x2="260" y2="121" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Sirf wahi error pass hai jiska naam aapne diya.</p></div>

<h3>vlan_range kya vaada karta hai</h3>
<p><code>vlan_range("10-12")</code> <code>[10, 11, 12]</code> return karta hai. Baaki jo kuch range nahi ho sakta woh <code>ValueError</code> uthata hai, message mein buri text quote karke:</p>
<pre class="out">AUTO01$ python3 -c "from netlib import vlan_range
for t in ['abc', '10', '10-', '-10', '20-10', '0-5', '4090-4095', '1000-1003']:
    try:
        vlan_range(t)
    except ValueError as e:
        print(e)"
not a range: 'abc'
not a range: '10'
not a range: '10-'
not a range: '-10'
range runs backwards: '20-10'
vlan out of range in '0-5'
vlan out of range in '4090-4095'
vlan out of range in '1000-1003'</pre>
<p>Galtiyon ke teen parivaar: <code>low-high</code> shape nahi, numbers ulte chalte hain, ya koi end valid VLAN nahi (0, 4095 aur reserved 1003 teeno <code>valid_vlan</code> mein fail hote hain). Har message buri value ka naam batata hai, jo log padhne wale ko chahiye.</p>

<h3>Tests</h3>
<p><code>test_range.py</code> likho:</p>
<pre class="code">import pytest

from netlib import vlan_range


def test_ok():
    assert vlan_range("10-12") == [10, 11, 12]


def test_backwards():
    with pytest.raises(ValueError, match="backwards"):
        vlan_range("20-10")


def test_not_a_range():
    with pytest.raises(ValueError):
        vlan_range("abc")</pre>
<ul>
<li><code>with pytest.raises(ValueError):</code> ek block kholta hai. Andar ki call ko <code>ValueError</code> (ya uski subclass) uthana hi hoga.</li>
<li><code>match="backwards"</code> message bhi check karta hai. Yeh regular expression hai jo message text ke andar search hoti hai, isliye ek shabd kaafi hai.</li>
<li>Happy path <code>test_ok</code> rehta hai: bure-input ke tests normal test ki jagah kabhi nahi lete.</li>
</ul>
<pre class="out">AUTO01$ pytest -q test_range.py
...                                                                      [100%]
<span class="hl">3 passed in 0.04s</span></pre>

<h3>Red raises test kaisa dikhta hai</h3>
<p>Galat hone ke teen tareeke. Output padho: har ek kuch alag batata hai.</p>
<pre class="code">import pytest

from netlib import vlan_range


def test_no_error_raised():
    with pytest.raises(ValueError):
        vlan_range("10-12")


def test_wrong_type():
    with pytest.raises(KeyError):
        vlan_range("abc")


def test_match_wrong():
    with pytest.raises(ValueError, match="backwards"):
        vlan_range("abc")</pre>
<pre class="out">AUTO01$ pytest -q test_raises_fail.py
FFF                                                                      [100%]

=================================== FAILURES ===================================
_____________________________ test_no_error_raised _____________________________

    def test_no_error_raised():
        with pytest.raises(ValueError):
&gt;           vlan_range("10-12")
E           Failed: DID NOT RAISE &lt;class 'ValueError'&gt;

test_raises_fail.py:8: Failed
_______________________________ test_wrong_type ________________________________

    def test_wrong_type():
        with pytest.raises(KeyError):
&gt;           vlan_range("abc")

test_raises_fail.py:13: 
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ 

    def vlan_range(text):
        """'10-12' -&gt; [10, 11, 12]. Raises ValueError for anything that is not a sensible range."""
        low, sep, high = text.partition("-")
        if not sep or not low.isdigit() or not high.isdigit():
&gt;           raise ValueError(f"not a range: {text!r}")
E           ValueError: not a range: 'abc'

netlib.py:18: ValueError
_______________________________ test_match_wrong _______________________________

    def test_match_wrong():
        with pytest.raises(ValueError, match="backwards"):
&gt;           vlan_range("abc")
E           AssertionError: Regex pattern did not match.
E            Regex: 'backwards'
E            Input: "not a range: 'abc'"

test_raises_fail.py:18: AssertionError
=========================== short test summary info ============================
FAILED test_raises_fail.py::test_no_error_raised - Failed: DID NOT RAISE &lt;cla...
FAILED test_raises_fail.py::test_wrong_type - ValueError: not a range: 'abc'
FAILED test_raises_fail.py::test_match_wrong - AssertionError: Regex pattern ...
<span class="hl">3 failed in 0.04s</span></pre>
<ul>
<li><b>DID NOT RAISE</b>: function ne "10-12" chupchaap accept kar liya. Ya to input asal mein valid hai (test galat hai) ya validation missing hai (code galat hai).</li>
<li><b>Galat error</b>: test ne <code>KeyError</code> expect kiya par code ne <code>ValueError</code> uthaya, aur woh error apne traceback ke saath failure ki tarah dikhta hai.</li>
<li><b>Regex did not match</b>: sahi type ka error aaya, par message "not a range" kehta hai, "backwards" nahi. Output regex aur input ko saath-saath print karta hai.</li>
</ul>

<h3>Message check karna, aur buri inputs ki table</h3>
<p>Error ko khud dekhna ho to use <code>as</code> se pakdo. Phir Chapter 4 ke <code>parametrize</code> ke saath <code>raises</code> milao taaki bure input ka har parivaar cover ho:</p>
<pre class="code">import pytest

from netlib import vlan_range


def test_message():
    with pytest.raises(ValueError) as info:
        vlan_range("20-10")
    assert "backwards" in str(info.value)


@pytest.mark.parametrize("text", ["abc", "10", "10-", "-10", "20-10", "0-5", "4090-4095", "1000-1003"])
def test_bad_ranges(text):
    with pytest.raises(ValueError):
        vlan_range(text)</pre>
<pre class="out">AUTO01$ pytest -v test_bad.py
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 9 items

test_bad.py::test_message PASSED                                         [ 11%]
test_bad.py::test_bad_ranges[abc] PASSED                                 [ 22%]
test_bad.py::test_bad_ranges[10] PASSED                                  [ 33%]
test_bad.py::test_bad_ranges[10-] PASSED                                 [ 44%]
test_bad.py::test_bad_ranges[-10] PASSED                                 [ 55%]
test_bad.py::test_bad_ranges[20-10] PASSED                               [ 66%]
test_bad.py::test_bad_ranges[0-5] PASSED                                 [ 77%]
test_bad.py::test_bad_ranges[4090-4095] PASSED                           [ 88%]
test_bad.py::test_bad_ranges[1000-1003] PASSED                           [100%]

============================== 9 passed in 0.10s ===============================</pre>
<p>Info object mein <code>info.value</code> exception hai, to <code>str(info.value)</code> uska message. Tez message check ke liye <code>match=</code> pasand karo, aur jab ek se zyada check chahiye to <code>as info</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>with</code> block ke andar us line ke baad aur statements rakhna jo raise karni chahiye: woh kabhi nahi chalte, kyunki block error par khatam ho jaata hai. Specific type ki jagah <code>Exception</code> pakadna, jo galat error ko chhupa deta hai. Test mein <code>pass</code> ke saath <code>try/except</code> use karna: kuch raise na ho tab bhi test pass ho jaata hai. Message ko literal samajhna jabki woh regex hai (dots aur brackets escape karne padte hain).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>pytest.raises</code> tabhi pass hota hai jab block ke andar naam wala error uthe. Error na aana failure hai (<code>DID NOT RAISE</code>), aur doosra error bhi. <code>match</code> regular expression search use karta hai.</p></div>

<div class="scn"><h4>Woh range jisne 4000 VLANs banane chahe</h4><p>Ek provisioning script ne "10-" (end missing) type ki hui range accept kar li aur khali end ko zero maan liya, jisse aisa loop bana jo hazaaron VLANs banane ki koshish karta tha. Helper ka test sirf "10-12" ke liye tha. Aath buri inputs ki table <code>pytest.raises</code> se jodne par helper ne sab ko kisi switch ko chhune se pehle reject kar diya.</p><p><b>Lesson:</b> insaanon aur files ka input aapki soch se zyada baar galat hota hai, isliye inkaar ko utni hi care se test karo jitni safalta ko.</p></div>

<div class="iv"><p class="q">"Function bure input par raise karta hai, yeh kaise test karte ho?"</p><p>pytest.raises ko context manager ki tarah: specific exception ka naam deta hoon, aksar message mein ek keyword ke liye match jodta hoon, aur test tab fail hota hai jab kuch raise na ho ya doosra error aaye. Ise bure inputs ki table par parametrize karta hoon aur happy path ke liye alag test rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>with pytest.raises(ValueError):</code> tabhi pass hota hai jab block ke andar wahi error aaye.</li>
<li>Koi error nahi to <code>DID NOT RAISE</code>; doosra error test ko apne traceback ke saath fail karta hai.</li>
<li><code>match="word"</code> message ko regex search se check karta hai; <code>as info</code> se <code>info.value</code> milta hai.</li>
<li>Buri inputs ki table ke liye <code>raises</code> ko <code>parametrize</code> ke saath milao.</li>
<li>Achhe messages buri value quote karte hain, jo log padhne wale ki madad karta hai.</li>
</ul></div>
`}};export{e as default};