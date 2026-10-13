var e={id:`test-commands`,h:{en:`Test commands: ask the firewall what it would do`,hi:`Test commands: firewall se poocho woh kya karega`},body:{en:`

<p><b>Ask before you send.</b> The test commands let you ask the firewall, "if this packet arrived, which rule would decide?" without sending any traffic and without involving the user. They are the fastest way to prove a policy or NAT problem, and a favourite interview topic.</p>

<h3>Analogy: asking the rulebook, not the traveller</h3>
<p>Instead of sending a traveller through the gate to see what happens, you read out their details to the supervisor and ask which page of the rulebook applies. If the answer is "page 1, allow", the rulebook is fine and the problem lies elsewhere. If the answer is "no page applies, default is deny", you have found it.</p>

<h3>test security-policy-match</h3>
<p>You describe one packet with the zones, the addresses, the protocol number (6 is TCP, 17 is UDP, 1 is ICMP) and the destination port. The firewall replies with the first rule that would match. Optionally add <code>application</code> to test an application-based rule.</p>
<pre class="code">test security-policy-match from dmz to untrust source 10.0.2.10 destination 8.8.8.8 protocol 6 destination-port 53</pre>
<p>On the lab firewall at the start of the DNS ticket (rule DMZ-Out allows only ping), the answer is:</p>
<pre class="out">PA1&gt; test security-policy-match from dmz to untrust source 10.0.2.10 destination 8.8.8.8 protocol 6 destination-port 53
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>This one line is the whole diagnosis: DNS from the DMZ matches no rule and falls to the predefined deny. Compare with traffic that is allowed:</p>
<pre class="out">PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
"Allow-Out; index: 1" {
        from trust;
        source any;
        to untrust;
        destination any;
        category any;
        application/service [ ping dns web-browsing ssl ]/application-default;
        <span class="hl">action allow;</span>
        terminal yes;
}</pre>
<p>The matched rule is printed with its fields, so you can see the application list and the action. If the wrong rule matches, you read why: a broader rule sits above, or a zone or address is not what you assumed.</p>

<h3>test nat-policy-match</h3>
<p>The same idea for NAT. Give the pre-NAT zones and addresses and read the translation.</p>
<pre class="out">PA1&gt; test nat-policy-match from dmz to untrust source 10.0.2.10 destination 8.8.8.8 protocol 6 destination-port 53
SNAT-Out; index: 1 {
        nat-type ipv4;
        from [ trust dmz ];
        source any;
        to untrust;
        destination any;
        service any;
        <span class="hl">translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";</span>
        terminal no;
}</pre>
<p>The line <code>translate-to</code> shows the result: source translated to the address of ethernet1/1, 203.0.113.2, by dynamic IP and port. For a destination NAT rule you would see a <code>dst:</code> value instead.</p>

<div class="eg"><p><b>Worked example.</b> A customer cannot reach a published server. You run test nat-policy-match with the public destination and see the right translation. You run test security-policy-match and it falls to interzone-default, because the rule used the private address instead of the public one. You now know it is a policy problem, not NAT, before you have touched anything.</p></div>

<h3>Other test commands to know</h3>
<ul>
<li><code>test routing fib-lookup virtual-router default ip 8.8.8.8</code> shows which route and interface the data plane would use. Reference only: this command is not available in the simulator, so use <code>show routing route</code> there.</li>
<li><code>test vpn ike-sa</code> and <code>test vpn ipsec-sa</code> start tunnel negotiation (covered in the VPN modules).</li>
<li>Authentication and User-ID tests exist as well; see the pan-userid module.</li>
</ul>

<h3>Common input mistakes</h3>
<table class="cmp"><tr><th>Mistake</th><th>Effect</th></tr>
<tr><td>Wrong zone name (case matters)</td><td>Result differs or an error is shown; copy the zone from show interface all</td></tr>
<tr><td>Using the translated address in a destination NAT security test</td><td>Test falls to the default rule</td></tr>
<tr><td>Forgetting the protocol number</td><td>Defaults may not match your intent; always give protocol and port</td></tr>
<tr><td>Leaving out application for an App-ID rule</td><td>The rule may not be matched; add application when the rule lists applications</td></tr>
</table>
<p>If you omit a required keyword, the lab shows the usage line so you can correct it:</p>
<pre class="out">PA1&gt; test security-policy-match from trust
Invalid syntax.
usage: test security-policy-match from &lt;zone&gt; to &lt;zone&gt; source &lt;ip&gt; destination &lt;ip&gt; protocol &lt;n&gt; destination-port &lt;port&gt; [application &lt;app&gt;]</pre>

<div class="warn"><p><b>Common mistake.</b> Trusting a test result you built from guesses. The test command only knows the values you type. Copy the real source, destination, zone and port from the session or from the user, and test the same flow that failed.</p></div>
<div class="exam"><p><b>Exam trap.</b> A test command never sends traffic and never creates a session. It evaluates the candidate or running policy as configured. If an exam item says "without generating traffic", pick the test command.</p></div>

<div class="scn"><h4>Ten minutes saved with one test</h4><p>After a maintenance window a finance app stopped working. Instead of running captures, the engineer ran test security-policy-match with the app server addresses and port, and it returned a deny rule called Block-Risky that someone had moved above the finance rule. Moving the finance rule up and committing fixed the ticket.</p><p><b>Lesson:</b> The matched rule name often shows the problem: wrong order, not wrong content. Use the test command before you edit anything.</p></div>

<div class="iv"><p class="q">"How can you check which security rule will apply to a flow without generating traffic?"</p><p>With test security-policy-match, giving from and to zones, source and destination, protocol and destination port, and the application if the rule uses applications. It returns the first matching rule and its action, or tells me the traffic falls to the predefined interzone or intrazone rule. I use test nat-policy-match the same way, and I mention that the security test uses the pre-NAT address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>test security-policy-match returns the first rule that would match, without sending traffic.</li>
<li>No match means the predefined interzone-default (deny) or intrazone-default (allow) rule.</li>
<li>test nat-policy-match returns the NAT rule and the translate-to value.</li>
<li>Give protocol number and destination port every time.</li>
<li>Test with the same values as the failing flow, then change one thing.</li>
</ul></div>

`,hi:`

<p><b>Bhejne se pehle poocho.</b> Test commands aapko firewall se poochne dete hain, "agar yeh packet aaye to kaunsi rule decide karegi?", bina traffic bheje aur bina user ko involve kiye. Yeh policy ya NAT problem saabit karne ka sabse tez tareeka hai, aur interview ka favourite topic.</p>

<h3>Analogy: traveller se nahi, rulebook se poochna</h3>
<p>Traveller ko gate se bhejkar dekhne ke bajaye aap supervisor ko uski details padhkar poochte ho ki rulebook ka kaunsa page lagta hai. Jawab "page 1, allow" ho to rulebook theek hai aur problem kahin aur hai. Jawab "koi page nahi lagta, default deny hai" ho to aapne problem pakad li.</p>

<h3>test security-policy-match</h3>
<p>Aap ek packet ko zones, addresses, protocol number (6 TCP, 17 UDP, 1 ICMP) aur destination port se describe karte ho. Firewall pehli rule batata hai jo match karegi. Application-based rule test karne ke liye optionally <code>application</code> jodo.</p>
<pre class="code">test security-policy-match from dmz to untrust source 10.0.2.10 destination 8.8.8.8 protocol 6 destination-port 53</pre>
<p>DNS ticket ki shuruaat mein lab firewall par (rule DMZ-Out sirf ping allow karti hai) jawab yeh hai:</p>
<pre class="out">PA1&gt; test security-policy-match from dmz to untrust source 10.0.2.10 destination 8.8.8.8 protocol 6 destination-port 53
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>Yeh ek line poora diagnosis hai: DMZ se DNS kisi rule se match nahi hota aur predefined deny par girta hai. Ab allowed traffic se compare karo:</p>
<pre class="out">PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
"Allow-Out; index: 1" {
        from trust;
        source any;
        to untrust;
        destination any;
        category any;
        application/service [ ping dns web-browsing ssl ]/application-default;
        <span class="hl">action allow;</span>
        terminal yes;
}</pre>
<p>Matched rule apni fields ke saath print hoti hai, isliye application list aur action dikh jaate hain. Galat rule match ho to wajah padho: upar koi broader rule hai, ya koi zone ya address waisa nahi jaisa socha tha.</p>

<h3>test nat-policy-match</h3>
<p>NAT ke liye wahi idea. Pre-NAT zones aur addresses do aur translation padho.</p>
<pre class="out">PA1&gt; test nat-policy-match from dmz to untrust source 10.0.2.10 destination 8.8.8.8 protocol 6 destination-port 53
SNAT-Out; index: 1 {
        nat-type ipv4;
        from [ trust dmz ];
        source any;
        to untrust;
        destination any;
        service any;
        <span class="hl">translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";</span>
        terminal no;
}</pre>
<p><code>translate-to</code> line result dikhati hai: source ethernet1/1 ke address 203.0.113.2 mein, dynamic IP and port se translate hua. Destination NAT rule ke liye aapko <code>dst:</code> value dikhegi.</p>

<div class="eg"><p><b>Worked example.</b> Customer published server tak nahi pahunch pa raha. Aap public destination se test nat-policy-match chalate ho aur sahi translation dikhti hai. test security-policy-match chalate ho to interzone-default par girta hai, kyunki rule ne public ke bajaye private address use kiya tha. Kuch chhuye bina pata chal gaya ki yeh policy problem hai, NAT nahi.</p></div>

<h3>Aur test commands jo pata hone chahiye</h3>
<ul>
<li><code>test routing fib-lookup virtual-router default ip 8.8.8.8</code> dikhata hai data plane kaunsa route aur interface use karega. Sirf reference: yeh command simulator mein nahi hai, wahan <code>show routing route</code> use karo.</li>
<li><code>test vpn ike-sa</code> aur <code>test vpn ipsec-sa</code> tunnel negotiation shuru karte hain (VPN modules mein).</li>
<li>Authentication aur User-ID ke tests bhi hote hain; pan-userid module dekho.</li>
</ul>

<h3>Input ki aam galtiyan</h3>
<table class="cmp"><tr><th>Galti</th><th>Asar</th></tr>
<tr><td>Zone naam galat (case matter karta hai)</td><td>Result alag aata hai ya error; zone show interface all se copy karo</td></tr>
<tr><td>Destination NAT security test mein translated address</td><td>Test default rule par girta hai</td></tr>
<tr><td>Protocol number bhool jaana</td><td>Defaults aapke irade se match nahi kar sakte; hamesha protocol aur port do</td></tr>
<tr><td>App-ID rule ke liye application chhod dena</td><td>Rule match nahi ho sakti; rule mein applications hon to application jodo</td></tr>
</table>
<p>Koi zaroori keyword chhoot jaye to lab usage line dikhata hai taaki aap theek kar sako:</p>
<pre class="out">PA1&gt; test security-policy-match from trust
Invalid syntax.
usage: test security-policy-match from &lt;zone&gt; to &lt;zone&gt; source &lt;ip&gt; destination &lt;ip&gt; protocol &lt;n&gt; destination-port &lt;port&gt; [application &lt;app&gt;]</pre>

<div class="warn"><p><b>Common mistake.</b> Andaze se banaye values par test result ka bharosa karna. Test command sirf wahi jaanta hai jo aap type karte ho. Asli source, destination, zone aur port session ya user se copy karo, aur wahi flow test karo jo fail hua.</p></div>
<div class="exam"><p><b>Exam trap.</b> Test command kabhi traffic nahi bhejta aur kabhi session nahi banata. Woh configured policy ko evaluate karta hai. Exam item mein "traffic generate kiye bina" ho to test command chuno.</p></div>

<div class="scn"><h4>Ek test se das minute bache</h4><p>Maintenance window ke baad finance app band ho gayi. Captures chalane ke bajaye engineer ne app server addresses aur port ke saath test security-policy-match chalaya, aur wapas ek deny rule Block-Risky aayi jo kisi ne finance rule ke upar rakh di thi. Finance rule ko upar le jaakar commit karne se ticket fix ho gaya.</p><p><b>Lesson:</b> Matched rule ka naam aksar problem dikha deta hai: galat order, galat content nahi. Kuch edit karne se pehle test command use karo.</p></div>

<div class="iv"><p class="q">"Traffic generate kiye bina kaise check karoge ki flow par kaunsi security rule lagegi?"</p><p>test security-policy-match se, from aur to zones, source aur destination, protocol aur destination port dekar, aur application agar rule applications use karti ho. Yeh pehli matching rule aur uska action deta hai, ya batata hai ki traffic predefined interzone ya intrazone rule par girta hai. test nat-policy-match isi tarah use karta hoon, aur batata hoon ki security test pre-NAT address use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>test security-policy-match bina traffic bheje pehli matching rule deta hai.</li>
<li>No match ka matlab predefined interzone-default (deny) ya intrazone-default (allow).</li>
<li>test nat-policy-match NAT rule aur translate-to value deta hai.</li>
<li>Har baar protocol number aur destination port do.</li>
<li>Fail hue flow ke same values se test karo, phir ek cheez badlo.</li>
</ul></div>

`}};export{e as default};