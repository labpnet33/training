var e={id:`verify-firewall`,h:{en:`Verifying on the firewall: running policy, test match and pushed policy`,hi:`Firewall par verify karna: running policy, test match aur pushed policy`},body:{en:`
<p><b>Analogy.</b> A courier says "delivered". You still walk to your door and check the parcel is there. In Panorama work, the push result says "succeeded", but the proof is on the firewall. Panorama tells you what it <i>sent</i>; the firewall tells you what it <i>has</i>. This chapter gives you three views and a method to combine them.</p>

<h3>The three views</h3>
<table class="tbl"><tr><th>Command (on the firewall)</th><th>Question it answers</th></tr>
<tr><td><code>show running security-policy</code></td><td>What is the final ordered rule list, pushed and local together?</td></tr>
<tr><td><code>test security-policy-match from &lt;zone&gt; to &lt;zone&gt; source &lt;ip&gt; destination &lt;ip&gt; protocol &lt;n&gt; destination-port &lt;p&gt;</code></td><td>Which single rule decides this exact flow, and what is its action?</td></tr>
<tr><td><code>show config pushed-shared-policy</code></td><td>What did Panorama push: objects, pre-rules, post-rules, NAT?</td></tr>
</table>
<p>Two companions complete the picture: <code>show running nat-policy</code> for translations, and on Panorama <code>show devices all</code> and <code>show devicegroups</code> for sync status.</p>

<h3>A repeatable method</h3>
<ol>
<li><b>Panorama:</b> did the commit finish, and did the push say "succeeded" for this firewall? <code>show devices all</code> shows In Sync or Out of Sync under Shared policy.</li>
<li><b>Firewall, pushed view:</b> is the rule or object I expect inside <code>show config pushed-shared-policy</code>? If not, the rule never arrived (a target, a missing push, an uncommitted edit).</li>
<li><b>Firewall, final list:</b> where does it sit in <code>show running security-policy</code>? Is something above it matching first?</li>
<li><b>Firewall, test:</b> run <code>test security-policy-match</code> with a real example flow and read the rule name.</li>
<li><b>User side:</b> repeat the real test from the PC and look at the log.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Verification flow">
<rect x="10" y="30" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Panorama</text><text x="80" y="73" text-anchor="middle" class="svg-muted" font-size="12">In Sync?</text>
<rect x="170" y="30" width="140" height="60" rx="8" fill="#bae6fd"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 pushed policy</text><text x="240" y="73" text-anchor="middle" class="svg-muted" font-size="12">did it arrive?</text>
<rect x="330" y="30" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 running policy</text><text x="400" y="73" text-anchor="middle" class="svg-muted" font-size="12">what position?</text>
<rect x="490" y="30" width="140" height="60" rx="8" fill="#fde68a"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 test match</text><text x="560" y="73" text-anchor="middle" class="svg-muted" font-size="12">which rule wins?</text>
<line x1="150" y1="60" x2="170" y2="60" stroke="#64748b"/><line x1="310" y1="60" x2="330" y2="60" stroke="#64748b"/><line x1="470" y1="60" x2="490" y2="60" stroke="#64748b"/>
</svg><p class="cap">Arrived, positioned, decided: three separate questions.</p></div>

<h3>Reading the outputs</h3>
<pre class="out">admin@NK-DELHI-PA&gt; test security-policy-match from trust to untrust source 10.2.1.10 destination 8.8.8.8 protocol 6 destination-port 23
"SH-Block-Telnet-Out; index: 1" {
        from any;
        source any;
        to any;
        destination any;
        application/service telnet/application-default;
        action deny;
}</pre>
<p>The rule name tells you the decision and the index tells you its position. When nothing matches, the lab says so explicitly:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.1.1.10 destination 203.0.113.99 protocol 6 destination-port 8443
No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</pre>
<p>A <code>show config pushed-shared-policy</code> output prints blocks (<code>address</code>, <code>pre-rulebase</code>, <code>post-rulebase</code>), so you can read object values and rule definitions exactly as the firewall received them. Compare a rule you see there with its position in the running list.</p>

<div class="eg"><p><b>Worked example.</b> You pushed a rule and a user still cannot connect. Step 1: In Sync. Step 2: the rule is in the pushed policy. Step 3: it sits at index 7, but index 3 is a broad deny for the same zones. Step 4: the test command names the index 3 rule. The fix is a position change on Panorama, not another allow rule.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Trusting "In Sync" as proof the rule works (it only says the last push matched); running the test command with the wrong zones; reading pushed policy and forgetting that a local rule above the post-rules could still decide the flow.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show config pushed-shared-policy</code> shows only what Panorama pushed; it will not list local rules. <code>show running security-policy</code> shows both in their real order.</p></div>

<div class="scn"><h4>"Delhi can do something Pune cannot"</h4><p>A manager noticed an application working from Delhi but blocked from Pune and suspected a bug. The engineer ran the test command on both firewalls with the same flow. Pune named a pushed deny; Delhi named a local rule above it. Comparing the pushed policy of the two firewalls showed identical central rules, so the difference was a local rule that the Delhi site had added with approval.</p><p><b>Lesson:</b> compare running lists for the final truth and pushed lists to separate central from local.</p></div>

<div class="iv"><p class="q">"How do you prove which rule is affecting a particular user's traffic?"</p><p>I run the policy-match test on the firewall with the exact zones, addresses, protocol and port, read the rule name and index, then look at that rule in the running list and in the pushed policy to see whether it is central or local, and confirm with a real test from the user side.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama says what it sent; the firewall says what it has.</li>
<li>running security-policy shows the final order; pushed-shared-policy shows only central content.</li>
<li>test security-policy-match names the single deciding rule for one flow.</li>
<li>Verify in order: sync, arrived, positioned, decided, user test.</li>
<li>A rule in running but not in pushed policy is local.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Courier kehta hai "delivered". Phir bhi aap apne darwaze tak jaakar dekhte ho ki parcel hai ya nahi. Panorama ke kaam mein push result kehta hai "succeeded", par proof firewall par hai. Panorama batata hai ki usne kya <i>bheja</i>; firewall batata hai ki uske paas kya <i>hai</i>. Ye chapter aapko teen views aur unhe jodne ka method deta hai.</p>

<h3>Teen views</h3>
<table class="tbl"><tr><th>Command (firewall par)</th><th>Kis sawal ka jawab</th></tr>
<tr><td><code>show running security-policy</code></td><td>Final ordered rule list kya hai, pushed aur local milakar?</td></tr>
<tr><td><code>test security-policy-match from &lt;zone&gt; to &lt;zone&gt; source &lt;ip&gt; destination &lt;ip&gt; protocol &lt;n&gt; destination-port &lt;p&gt;</code></td><td>Is exact flow ko kaunsi ek rule decide karti hai, aur uska action kya hai?</td></tr>
<tr><td><code>show config pushed-shared-policy</code></td><td>Panorama ne kya push kiya: objects, pre-rules, post-rules, NAT?</td></tr>
</table>
<p>Do saathi picture poori karte hain: translations ke liye <code>show running nat-policy</code>, aur Panorama par sync status ke liye <code>show devices all</code> aur <code>show devicegroups</code>.</p>

<h3>Repeatable method</h3>
<ol>
<li><b>Panorama:</b> commit khatam hua, aur push ne is firewall ke liye "succeeded" kaha? <code>show devices all</code> Shared policy ke neeche In Sync ya Out of Sync dikhata hai.</li>
<li><b>Firewall, pushed view:</b> jo rule ya object expected hai wo <code>show config pushed-shared-policy</code> ke andar hai? Nahi, to rule pahunchi hi nahi (target, push missing, uncommitted edit).</li>
<li><b>Firewall, final list:</b> <code>show running security-policy</code> mein wo kahan baithi hai? Kya upar kuch pehle match kar raha hai?</li>
<li><b>Firewall, test:</b> real example flow ke saath <code>test security-policy-match</code> chalao aur rule ka naam padho.</li>
<li><b>User side:</b> PC se real test dohrao aur log dekho.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Verification flow">
<rect x="10" y="30" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Panorama</text><text x="80" y="73" text-anchor="middle" class="svg-muted" font-size="12">In Sync?</text>
<rect x="170" y="30" width="140" height="60" rx="8" fill="#bae6fd"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 pushed policy</text><text x="240" y="73" text-anchor="middle" class="svg-muted" font-size="12">pahunchi?</text>
<rect x="330" y="30" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 running policy</text><text x="400" y="73" text-anchor="middle" class="svg-muted" font-size="12">kaunsi position?</text>
<rect x="490" y="30" width="140" height="60" rx="8" fill="#fde68a"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 test match</text><text x="560" y="73" text-anchor="middle" class="svg-muted" font-size="12">kaunsi rule jeetti?</text>
<line x1="150" y1="60" x2="170" y2="60" stroke="#64748b"/><line x1="310" y1="60" x2="330" y2="60" stroke="#64748b"/><line x1="470" y1="60" x2="490" y2="60" stroke="#64748b"/>
</svg><p class="cap">Pahunchi, position, decide: teen alag sawal.</p></div>

<h3>Outputs padhna</h3>
<pre class="out">admin@NK-DELHI-PA&gt; test security-policy-match from trust to untrust source 10.2.1.10 destination 8.8.8.8 protocol 6 destination-port 23
"SH-Block-Telnet-Out; index: 1" {
        from any;
        source any;
        to any;
        destination any;
        application/service telnet/application-default;
        action deny;
}</pre>
<p>Rule ka naam decision batata hai aur index uski position. Kuch match na kare to lab saaf kehta hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.1.1.10 destination 203.0.113.99 protocol 6 destination-port 8443
No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</pre>
<p><code>show config pushed-shared-policy</code> output blocks print karta hai (<code>address</code>, <code>pre-rulebase</code>, <code>post-rulebase</code>), isliye object values aur rule definitions bilkul waise padh sakte ho jaise firewall ko mili. Wahan dikhi rule ko running list mein uski position se compare karo.</p>

<div class="eg"><p><b>Worked example.</b> Aapne rule push ki aur user phir bhi connect nahi kar pa raha. Step 1: In Sync. Step 2: rule pushed policy mein hai. Step 3: wo index 7 par hai, par index 3 usi zones ke liye broad deny hai. Step 4: test command index 3 wali rule ka naam deta hai. Fix Panorama par position change hai, ek aur allow rule nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> "In Sync" ko proof maan lena ki rule kaam karti hai (wo sirf kehta hai ki pichhla push match hua); test command galat zones ke saath chalana; pushed policy padhna aur bhool jana ki post-rules ke upar ki local rule bhi flow decide kar sakti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show config pushed-shared-policy</code> sirf wo dikhata hai jo Panorama ne push kiya; local rules list nahi karega. <code>show running security-policy</code> dono ko unke real order mein dikhata hai.</p></div>

<div class="scn"><h4>"Delhi se jo ho sakta hai wo Pune se nahi"</h4><p>Ek manager ne dekha ki application Delhi se chalta hai par Pune se block hai, aur bug ka shak kiya. Engineer ne dono firewalls par same flow ke saath test command chalayi. Pune ne pushed deny ka naam diya; Delhi ne uske upar ki local rule ka. Dono firewalls ki pushed policy compare karne par central rules identical nikli, to fark ek local rule thi jo Delhi site ne approval ke saath jodi thi.</p><p><b>Lesson:</b> final truth ke liye running lists compare karo aur central ko local se alag karne ke liye pushed lists.</p></div>

<div class="iv"><p class="q">"Kaise prove karoge ki kisi user ke traffic par kaunsi rule asar kar rahi hai?"</p><p>Firewall par exact zones, addresses, protocol aur port ke saath policy-match test chalata hoon, rule ka naam aur index padhta hoon, phir running list aur pushed policy mein wo rule dekhta hoon ki central hai ya local, aur user side se real test se confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama batata hai usne kya bheja; firewall batata hai uske paas kya hai.</li>
<li>running security-policy final order dikhata hai; pushed-shared-policy sirf central content.</li>
<li>test security-policy-match ek flow ke liye akeli deciding rule ka naam deta hai.</li>
<li>Order mein verify karo: sync, pahunchi, position, decide, user test.</li>
<li>Running mein ho par pushed policy mein na ho to rule local hai.</li>
</ul></div>
`}};export{e as default};