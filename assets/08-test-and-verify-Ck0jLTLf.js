var e={id:`test-verify`,h:{en:`Proving a policy: test policy, show policy and safe commits`,hi:`Policy ko prove karna: test policy, show policy aur safe commits`},body:{en:`
<p>A good engineer never says "I think the policy works". They prove it, before and after the commit. Junos gives you several tools for that. This chapter shows each tool, what its output means, and the traps hidden inside it.</p>

<h3>Analogy: a dress rehearsal</h3>
<p>A theatre does not open the doors and hope. It runs a dress rehearsal where nobody in the audience is affected. <code>test policy</code> is your dress rehearsal: it runs a policy against the real routing table, but changes nothing and tells nothing to any neighbour.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Verification workflow">
<rect x="15" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="70" y="88" text-anchor="middle" class="svg-ink" font-size="13">1. show policy</text><text x="70" y="106" text-anchor="middle" class="svg-muted" font-size="11">read the logic</text>
<rect x="140" y="60" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="195" y="88" text-anchor="middle" class="svg-ink" font-size="13">2. test policy</text><text x="195" y="106" text-anchor="middle" class="svg-muted" font-size="11">dry run</text>
<rect x="265" y="60" width="110" height="60" rx="8" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">3. commit check</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">syntax</text>
<rect x="390" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="445" y="88" text-anchor="middle" class="svg-ink" font-size="13">4. commit</text><text x="445" y="106" text-anchor="middle" class="svg-muted" font-size="11">apply</text>
<rect x="515" y="60" width="110" height="60" rx="8" fill="#fed7aa"/><text x="570" y="88" text-anchor="middle" class="svg-ink" font-size="13">5. show route</text><text x="570" y="106" text-anchor="middle" class="svg-muted" font-size="11">on neighbour</text>
<line x1="125" y1="90" x2="140" y2="90" stroke="#64748b" stroke-width="2"/><line x1="250" y1="90" x2="265" y2="90" stroke="#64748b" stroke-width="2"/><line x1="375" y1="90" x2="390" y2="90" stroke="#64748b" stroke-width="2"/><line x1="500" y1="90" x2="515" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Predict, test, apply, then confirm at the receiver</text>
</svg><p class="cap">Five steps for every policy change.</p></div>

<h3>Tool 1: show policy</h3>
<pre class="out">lab@R1&gt; show policy
Configured policies:
PARTNER-OUT
NO-MGMT
SET-TAG
STATICS

lab@R1&gt; show policy PARTNER-OUT
Policy PARTNER-OUT:
    Term PARTNERS:
        from proto Static
        from     172.20.0.0/16 orlonger
        then     metric 20
        then     accept</pre>
<p><code>show policy NAME</code> prints the terms in the order they are evaluated. It is the fastest way to spot a leftover route-filter or a term in the wrong place. Also use <code>show configuration policy-options policy-statement NAME</code> to see the stanza as stored.</p>

<h3>Tool 2: test policy</h3>
<p>The syntax is <code>test policy POLICY-NAME PREFIX</code>. It evaluates the policy against the <b>active routes in inet.0 that fall inside PREFIX</b>, prints the accepted ones, and ends with a count.</p>
<pre class="out">lab@R1&gt; test policy NO-MGMT 192.168.99.0/24

inet.0: 12 destinations, 12 routes (12 active, 0 holddown, 0 hidden)
Policy NO-MGMT: 0 prefix accepted, 1 prefix rejected</pre>
<ul>
<li>Use <code>0/0</code> to test everything: <code>test policy PARTNER-OUT 0/0</code>.</li>
<li>It evaluates the single policy you name. It does <b>not</b> evaluate the whole chain applied to a protocol. Test each policy, then reason about the order.</li>
<li><b>Default-action trap.</b> For a route that no term decides on, test policy assumes <b>accept</b>. A real OSPF export would reject it. So a policy containing only modifying actions looks like "accepts everything" in test policy.</li>
<li>It tests routes that exist in the table. A prefix that is not currently in inet.0 produces no output. Test the real prefixes, not an imaginary one.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Policy SET-TAG has one term: <code>then tag 300</code>. You run:</p>
<pre class="out">lab@R1&gt; test policy SET-TAG 192.168.99.0/24

inet.0: 12 destinations, 12 routes (12 active, 0 holddown, 0 hidden)
192.168.99.0/24    *[Static/5] 01:04:11
                    &gt; to 10.52.90.2 via ge-0/0/1.0
Policy SET-TAG: 1 prefix accepted, 0 prefix rejected</pre>
<p>"1 accepted" does not mean OSPF will export it. SET-TAG made no decision; test policy counted the undecided route as accepted. In the real chain, the next policy or the protocol default decides.</p></div>

<h3>Tool 3: commit check and compare</h3>
<pre class="code">lab@R1# show | compare
[edit protocols ospf]
+   export PARTNER-OUT;

lab@R1# commit check
configuration check succeeds</pre>
<p><code>show | compare</code> prints the difference between the candidate and the active configuration. Read it before every commit: you will catch an accidental delete or a policy applied to the wrong protocol. <code>commit check</code> validates syntax and references (for example a policy name that does not exist) without activating. If you reference a missing policy, the commit fails with a warning that the policy is not defined.</p>
<p>If a change goes wrong, <code>rollback 1</code> then <code>commit</code> returns to the previous version, and <code>show system commit</code> lists your history.</p>

<h3>Tool 4: look at the receiver</h3>
<pre class="out">lab@R2&gt; show route 172.20.1.0/24 detail

172.20.1.0/24 (1 entry, 1 announced)
        *OSPF   Preference: 150
                Next hop type: Router, Next hop index: 579
                Source: 10.44.12.1
                State: &lt;Active Int Ext&gt;
                Age: 4:10      Metric: 20
                <span class="hl">Tag: 0</span>
                AS path: I</pre>
<p>Check <b>Preference</b>, <b>Metric</b>, <b>Tag</b> and <b>Source</b> (the router that originated the route). For BGP you also have <code>show route advertising-protocol bgp NEIGHBOR</code> to see exactly what you send. OSPF has no such command; verify on the neighbour with <code>show ospf database external</code>.</p>
<pre class="out">lab@R2&gt; show ospf database external

    OSPF AS SCOPE link state database
Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len
Extern   172.20.1.0        10.44.255.1  0x80000001    45  0x22 0x4b2c  36
Extern   172.20.2.0        10.44.255.1  0x80000001    45  0x22 0x91a0  36
Extern   172.20.8.0        10.44.255.1  0x80000001    45  0x22 0x6fd3  36</pre>

<div class="warn"><p><b>Common mistake.</b> Testing with a prefix that is not in the table, getting no output, and concluding the policy works. Always read the accepted and rejected counts, and test both an allowed and a forbidden prefix.</p></div>
<div class="exam"><p><b>Exam trap.</b> test policy assumes accept for undecided routes, but the actual protocol default may be reject. The exam also asks what <code>show | compare</code> shows: the difference between candidate and active configuration.</p></div>

<div class="scn"><h4>The test that said yes and the network that said no</h4><p>A junior engineer wrote a tag-only policy and ran test policy. It reported "all prefixes accepted", so he told the change board the policy was safe to apply as an export. After commit, nothing changed on the neighbours. A senior engineer explained that the policy contained no accept: the OSPF default export rejected every route, while test policy used a default of accept. They added <code>then accept</code> in the right policy and re-tested. The lesson went into the team's change template: "test policy proves terms, not protocol defaults."</p><p><b>Lesson:</b> know what the tool assumes.</p></div>

<div class="iv"><p class="q">"How do you verify a routing policy before and after you apply it?"</p><p>Strong answer: show policy NAME to read the logic; test policy NAME PREFIX to dry-run against the real table, with both an allowed and a forbidden prefix; show | compare and commit check before committing; after commit verify on the neighbour with show route PREFIX detail and, for BGP, show route advertising-protocol bgp. Mention that test policy assumes accept for undecided routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show policy NAME displays terms in evaluation order; use it to spot leftovers.</li>
<li>test policy POLICY PREFIX dry-runs one policy against active inet.0 routes and prints counts.</li>
<li>test policy treats undecided routes as accepted; real protocol defaults may reject.</li>
<li>show | compare and commit check catch mistakes before they go live.</li>
<li>Always confirm on the receiving router: preference, metric, tag, source.</li>
</ul></div>
`,hi:`
<p>Achha engineer kabhi nahi kehta "mujhe lagta hai policy chalti hai". Woh commit se pehle aur baad dono mein prove karta hai. Junos iske liye kai tools deta hai. Yeh chapter har tool, uske output ka matlab, aur usme chhupe traps dikhata hai.</p>

<h3>Analogy: dress rehearsal</h3>
<p>Theatre darwaze kholkar umeed nahi karta. Woh dress rehearsal chalata hai jisme audience par koi asar nahi padta. <code>test policy</code> aapka dress rehearsal hai: woh policy ko asli routing table par chalata hai, lekin kuch badalta nahi aur kisi neighbour ko kuch nahi batata.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Verification workflow">
<rect x="15" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="70" y="88" text-anchor="middle" class="svg-ink" font-size="13">1. show policy</text><text x="70" y="106" text-anchor="middle" class="svg-muted" font-size="11">logic padho</text>
<rect x="140" y="60" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="195" y="88" text-anchor="middle" class="svg-ink" font-size="13">2. test policy</text><text x="195" y="106" text-anchor="middle" class="svg-muted" font-size="11">dry run</text>
<rect x="265" y="60" width="110" height="60" rx="8" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">3. commit check</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">syntax</text>
<rect x="390" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="445" y="88" text-anchor="middle" class="svg-ink" font-size="13">4. commit</text><text x="445" y="106" text-anchor="middle" class="svg-muted" font-size="11">apply</text>
<rect x="515" y="60" width="110" height="60" rx="8" fill="#fed7aa"/><text x="570" y="88" text-anchor="middle" class="svg-ink" font-size="13">5. show route</text><text x="570" y="106" text-anchor="middle" class="svg-muted" font-size="11">neighbour par</text>
<line x1="125" y1="90" x2="140" y2="90" stroke="#64748b" stroke-width="2"/><line x1="250" y1="90" x2="265" y2="90" stroke="#64748b" stroke-width="2"/><line x1="375" y1="90" x2="390" y2="90" stroke="#64748b" stroke-width="2"/><line x1="500" y1="90" x2="515" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Predict, test, apply, phir receiver par confirm</text>
</svg><p class="cap">Har policy change ke liye paanch steps.</p></div>

<h3>Tool 1: show policy</h3>
<pre class="out">lab@R1&gt; show policy
Configured policies:
PARTNER-OUT
NO-MGMT
SET-TAG
STATICS

lab@R1&gt; show policy PARTNER-OUT
Policy PARTNER-OUT:
    Term PARTNERS:
        from proto Static
        from     172.20.0.0/16 orlonger
        then     metric 20
        then     accept</pre>
<p><code>show policy NAME</code> terms ko evaluation order mein print karta hai. Bacha hua route-filter ya galat jagah wala term pakadne ka sabse tez tareeka. <code>show configuration policy-options policy-statement NAME</code> bhi use karo, stanza waise hi dikhta hai jaise stored hai.</p>

<h3>Tool 2: test policy</h3>
<p>Syntax hai <code>test policy POLICY-NAME PREFIX</code>. Yeh policy ko <b>inet.0 ke un active routes par chalata hai jo PREFIX ke andar aate hain</b>, accepted wale print karta hai, aur end mein count deta hai.</p>
<pre class="out">lab@R1&gt; test policy NO-MGMT 192.168.99.0/24

inet.0: 12 destinations, 12 routes (12 active, 0 holddown, 0 hidden)
Policy NO-MGMT: 0 prefix accepted, 1 prefix rejected</pre>
<ul>
<li>Sab test karne ke liye <code>0/0</code> use karo: <code>test policy PARTNER-OUT 0/0</code>.</li>
<li>Yeh sirf us ek policy ko evaluate karta hai jiska naam do. Protocol par lagi <b>poori chain</b> evaluate <b>nahi</b> karta. Har policy test karo, phir order ke baare mein reason karo.</li>
<li><b>Default-action trap.</b> Jis route par koi term decide na kare, test policy uske liye <b>accept</b> maanta hai. Asli OSPF export use reject karta. Isliye sirf modifying actions wali policy test policy mein "sab accept" dikhti hai.</li>
<li>Yeh table mein maujood routes test karta hai. Jo prefix abhi inet.0 mein nahi hai uska output nahi aata. Asli prefixes test karo, kalpanik nahi.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Policy SET-TAG mein ek term hai: <code>then tag 300</code>. Aap chalate ho:</p>
<pre class="out">lab@R1&gt; test policy SET-TAG 192.168.99.0/24

inet.0: 12 destinations, 12 routes (12 active, 0 holddown, 0 hidden)
192.168.99.0/24    *[Static/5] 01:04:11
                    &gt; to 10.52.90.2 via ge-0/0/1.0
Policy SET-TAG: 1 prefix accepted, 0 prefix rejected</pre>
<p>"1 accepted" ka matlab yeh nahi ki OSPF use export karega. SET-TAG ne koi decision nahi liya; test policy ne undecided route ko accepted gina. Asli chain mein agli policy ya protocol default decide karta hai.</p></div>

<h3>Tool 3: commit check aur compare</h3>
<pre class="code">lab@R1# show | compare
[edit protocols ospf]
+   export PARTNER-OUT;

lab@R1# commit check
configuration check succeeds</pre>
<p><code>show | compare</code> candidate aur active configuration ka difference print karta hai. Har commit se pehle padho: accidental delete ya galat protocol par lagi policy pakad loge. <code>commit check</code> syntax aur references (jaise policy ka naam jo exist nahi karta) activate kiye bina validate karta hai. Missing policy reference karoge to commit warning ke saath fail hoga ki policy defined nahi hai.</p>
<p>Agar change galat jaaye to <code>rollback 1</code> phir <code>commit</code> pichle version par wapas le jaata hai, aur <code>show system commit</code> aapki history dikhata hai.</p>

<h3>Tool 4: receiver ko dekho</h3>
<pre class="out">lab@R2&gt; show route 172.20.1.0/24 detail

172.20.1.0/24 (1 entry, 1 announced)
        *OSPF   Preference: 150
                Next hop type: Router, Next hop index: 579
                Source: 10.44.12.1
                State: &lt;Active Int Ext&gt;
                Age: 4:10      Metric: 20
                <span class="hl">Tag: 0</span>
                AS path: I</pre>
<p><b>Preference</b>, <b>Metric</b>, <b>Tag</b> aur <b>Source</b> (route originate karne wala router) check karo. BGP ke liye <code>show route advertising-protocol bgp NEIGHBOR</code> bhi hai jisse dikhta hai aap exactly kya bhej rahe ho. OSPF mein aisa command nahi; neighbour par <code>show ospf database external</code> se verify karo.</p>
<pre class="out">lab@R2&gt; show ospf database external

    OSPF AS SCOPE link state database
Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len
Extern   172.20.1.0        10.44.255.1  0x80000001    45  0x22 0x4b2c  36
Extern   172.20.2.0        10.44.255.1  0x80000001    45  0x22 0x91a0  36
Extern   172.20.8.0        10.44.255.1  0x80000001    45  0x22 0x6fd3  36</pre>

<div class="warn"><p><b>Common mistake.</b> Aisa prefix test karna jo table mein nahi hai, output na milna, aur maan lena ki policy chalti hai. Hamesha accepted aur rejected counts padho, aur ek allowed aur ek forbidden prefix dono test karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> test policy undecided routes ko accept maanta hai, lekin asli protocol default reject ho sakta hai. Exam yeh bhi poochta hai ki <code>show | compare</code> kya dikhata hai: candidate aur active configuration ka difference.</p></div>

<div class="scn"><h4>Test ne haan kaha aur network ne na</h4><p>Ek junior engineer ne sirf tag wali policy likhi aur test policy chalaya. Usne "sab prefixes accepted" bataya, to usne change board ko kaha ki policy export ke roop mein apply karna safe hai. Commit ke baad neighbours par kuch nahi badla. Senior engineer ne samjhaya ki policy mein accept tha hi nahi: OSPF default export har route reject kar raha tha, jabki test policy ka default accept hai. Sahi policy mein <code>then accept</code> jodkar re-test kiya. Seekh team ke change template mein gayi: "test policy terms prove karta hai, protocol defaults nahi."</p><p><b>Lesson:</b> jaano ki tool kya maan kar chalta hai.</p></div>

<div class="iv"><p class="q">"Routing policy apply karne se pehle aur baad kaise verify karte ho?"</p><p>Strong answer: logic padhne ke liye show policy NAME; asli table par dry-run ke liye test policy NAME PREFIX, ek allowed aur ek forbidden prefix ke saath; commit se pehle show | compare aur commit check; commit ke baad neighbour par show route PREFIX detail aur BGP ke liye show route advertising-protocol bgp. Bolo ki test policy undecided routes ko accept maanta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show policy NAME terms ko evaluation order mein dikhata hai; leftovers pakadne ke liye use karo.</li>
<li>test policy POLICY PREFIX ek policy ko active inet.0 routes par dry-run karta hai aur counts print karta hai.</li>
<li>test policy undecided routes ko accepted maanta hai; asli protocol default reject ho sakta hai.</li>
<li>show | compare aur commit check galtiyan live hone se pehle pakadte hain.</li>
<li>Hamesha receiving router par confirm karo: preference, metric, tag, source.</li>
</ul></div>
`}};export{e as default};