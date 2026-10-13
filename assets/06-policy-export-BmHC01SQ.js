var e={id:`policy-export`,h:{en:`Routing policy basics: exporting static, aggregate and generated routes`,hi:`Routing policy basics: static, aggregate aur generated routes export karna`},body:{en:`
<p><b>Why policy.</b> Static, aggregate and generated routes exist only on one router. To share them you must tell a routing protocol: "advertise these routes." Junos does this with <b>routing policy</b>. A policy is a small program with a simple shape: for each route that passes by, test some conditions and then decide what to do. You already used one in the previous chapters; here you learn how to read and write them properly.</p>
<p>Analogy: a policy is a mail room filter. Every letter (route) goes past the clerk. The clerk has a list of rules ("letters from the finance department go to the CFO"; "anything else goes to the bin"). The first rule that fits wins. Import policies control what the post office <i>receives</i> into the table; export policies control what it <i>sends out</i>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Policy structure">
<rect x="20" y="70" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="90" y="95" text-anchor="middle" class="svg-ink" font-size="13">inet.0</text><text x="90" y="113" text-anchor="middle" class="svg-muted" font-size="12">all routes</text>
<rect x="230" y="30" width="180" height="140" rx="10" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="14">policy-statement AGG-OUT</text>
<text x="245" y="85" class="svg-ink" font-size="12">term 1</text><text x="255" y="105" class="svg-ink" font-size="12">from protocol aggregate</text><text x="255" y="123" class="svg-ink" font-size="12">from route-filter ... exact</text><text x="255" y="141" class="svg-ink" font-size="12">then accept</text>
<rect x="480" y="70" width="140" height="60" rx="10" fill="#bae6fd"/><text x="550" y="95" text-anchor="middle" class="svg-ink" font-size="13">OSPF / BGP</text><text x="550" y="113" text-anchor="middle" class="svg-muted" font-size="12">export</text>
<line x1="160" y1="100" x2="230" y2="100" stroke="#64748b" stroke-width="2"/><line x1="410" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Routes pass through the policy; accepted routes are exported.</p></div>

<h3>Structure of a policy-statement</h3>
<pre class="code">set policy-options policy-statement NAME term T1 from ...        <span class="c">! conditions (all must be true)</span>
set policy-options policy-statement NAME term T1 then accept      <span class="c">! action</span>
set policy-options policy-statement NAME term T2 then reject</pre>
<ul>
<li>A policy has one or more <b>terms</b>, evaluated in order. The first term whose <b>from</b> conditions are all true applies its <b>then</b> actions.</li>
<li>A term with no <code>from</code> matches every route.</li>
<li><code>accept</code> and <code>reject</code> end the policy. If no term ends it (for example a term that only sets a metric), the router goes to the next term, then to the <b>default policy</b> of the protocol.</li>
<li>For OSPF and BGP exports, the default policy for routes that match nothing is to reject (OSPF and BGP export only their own protocol's routes by default). That is why a policy that does not mention a route type exports nothing of it.</li>
</ul>

<h3>Match conditions</h3>
<table class="cmp"><tr><th>Condition</th><th>Meaning</th></tr>
<tr><td><code>from protocol aggregate | static | direct | bgp | ospf</code></td><td>the route's source</td></tr>
<tr><td><code>from route-filter PREFIX MATCH-TYPE</code></td><td>prefix and length test</td></tr>
<tr><td><code>from interface ge-0/0/1.0</code></td><td>interface the route comes from</td></tr>
<tr><td><code>from neighbor ADDRESS</code></td><td>the neighbour that advertised it</td></tr></table>

<h3>Route-filter match types</h3>
<p>This is a favourite exam topic. For the prefix <b>10.40.0.0/16</b>:</p>
<table class="cmp"><tr><th>Type</th><th>Matches</th></tr>
<tr><td><code>exact</code></td><td>only 10.40.0.0/16</td></tr>
<tr><td><code>orlonger</code></td><td>10.40.0.0/16 and anything more specific inside it (/17, /24, /32 ...)</td></tr>
<tr><td><code>longer</code></td><td>more specific only, not the /16 itself</td></tr>
<tr><td><code>upto /24</code></td><td>the /16 down to /24 inclusive</td></tr>
<tr><td><code>prefix-length-range /20-/24</code></td><td>lengths from 20 to 24 inside the range</td></tr></table>
<p>When you export an aggregate you nearly always want <code>exact</code>. If you used <code>orlonger</code> the policy would also match the more specific static routes, but only routes whose protocol is <code>aggregate</code> match anyway when you also write <code>from protocol aggregate</code>. Combining conditions narrows the match: <b>all</b> conditions of one term must be true.</p>

<h3>Applying the policy</h3>
<pre class="code">set protocols ospf export AGG-OUT
set protocols bgp group ISP export AGG-OUT         <span class="c">! same idea for BGP</span>
set protocols ospf export [ P1 P2 ]                <span class="c">! chain: evaluated left to right</span></pre>
<p>The <code>set protocols ospf export</code> statement <i>adds</i> a policy to the list if you set it again; it does not replace the old one. If an old export (like STATICS-OUT in the campus lab) is still there, both policies run. Use <code>delete protocols ospf export</code> first to start clean. Real output after the change:</p>
<pre class="out">lab@EDGE&gt; show configuration policy-options
policy-statement AGG-OUT {
    term 1 {
        from {
            protocol aggregate;
            route-filter 10.40.0.0/16 exact;
        }
        then {
            accept;
        }
    }
}

lab@EDGE&gt; show configuration protocols ospf
area 0.0.0.0 {
    interface ge-0/0/0.0;
    interface lo0.0 {
        passive;
    }
}
<span class="hl">export AGG-OUT;</span></pre>

<h3>Seeing the result in the neighbour</h3>
<p>A route exported into OSPF becomes an <b>external</b> route: an LSA of type 5 (AS external). Its preference on the receiving router is 150. In the campus lab:</p>
<pre class="out">lab@CORE&gt; show ospf database external
 Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len
Extern   10.40.0.0        10.255.0.1       0x80000001    25  0x22 0x58a9  36

lab@CORE&gt; show route 10.40.0.0/16 detail
10.40.0.0/16 (1 entry, 1 announced)
        *OSPF Preference: 150
                Next hop type: Router
                Next hop: 10.0.40.1 via ge-0/0/0.0, selected
                Task: OSPF</pre>
<p>One LSA for the whole summary, advertised by router ID 10.255.0.1 (EDGE). Before the change CORE received one LSA for each campus static route.</p>
<p>Other useful tools: <code>show route advertising-protocol bgp NEIGHBOR</code> for BGP exports, <code>show route protocol ospf</code> for what a neighbour learned, and <code>test policy NAME PREFIX</code> to check which routes in the table a policy accepts. Read its result critically: it lists every route that matches the policy conditions, not just the one you expect.</p>

<div class="eg"><p><b>Worked example.</b> You want OSPF to carry the aggregate 10.40.0.0/16 but never any static route. Policy: <code>from protocol aggregate</code>, <code>route-filter 10.40.0.0/16 exact</code>, <code>then accept</code>. Static routes do not match the protocol condition, so they fall to the default policy, which rejects them for OSPF. A policy that says <code>from protocol static</code> would do the opposite.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing <code>from protocol static</code> to export an aggregate or generated route. Aggregates and generated routes are protocol <code>aggregate</code>. Another trap: adding a new export statement without deleting the old one, so the old policy still exports every static.</p></div>
<div class="exam"><p><b>Exam trap.</b> Learn the five route-filter types (exact, orlonger, longer, upto, prefix-length-range) and remember that <code>accept</code> and <code>reject</code> terminate the policy. Policies are import or export from the point of view of the routing table: export sends routes <i>out of</i> the table into a protocol.</p></div>

<div class="scn"><h4>Two policies, one mystery</h4><p>After adding the summary, the core still showed every campus /24. The engineer's new policy was correct, but the old STATICS-OUT export was still attached to OSPF: two policies were being evaluated, and the old one exported the statics. A <code>show configuration protocols ospf</code> revealed the second export statement. Deleting it left only the aggregate in the core.</p><p><b>Lesson:</b> always verify the final applied list of policies, not only the policy you wrote.</p></div>
<div class="iv"><p class="q">"How do you advertise an aggregate route into OSPF?"</p><p>Create a policy-statement with a term <code>from protocol aggregate</code> and a route-filter with exact match for the summary, then accept, and attach it with <code>set protocols ospf export POLICY</code>. The route appears in neighbours as an OSPF external route with preference 150. Mention removing old export policies and checking the OSPF external database.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy = ordered terms with from conditions and then actions; first match wins.</li>
<li>Aggregate and generated routes match <code>from protocol aggregate</code>.</li>
<li>Route-filter types: exact, orlonger, longer, upto, prefix-length-range.</li>
<li>Export policies are attached under the protocol; set adds, so delete old ones first.</li>
<li>OSPF exports appear as type 5 external routes, preference 150.</li>
</ul></div>
`,hi:`
<p><b>Policy kyun.</b> Static, aggregate aur generated routes sirf ek router par hote hain. Unhe share karne ke liye routing protocol ko batana padta hai: "yeh routes advertise karo." Junos yeh <b>routing policy</b> se karta hai. Policy ek chhota program hai jiski shakal simple hai: jo bhi route guzre uske liye kuch conditions test karo aur phir tay karo kya karna hai. Pichle chapters mein aap ek policy use kar chuke ho; yahan unhe theek se padhna aur likhna seekhoge.</p>
<p>Analogy: policy ek mail room filter hai. Har letter (route) clerk ke saamne se guzarta hai. Clerk ke paas rules ki list hai ("finance department ke letters CFO ko jaayenge"; "baaki sab dustbin mein"). Jo pehla rule fit ho wahi jeetta hai. Import policies tay karti hain ki post office table mein kya <i>receive</i> kare; export policies tay karti hain ki kya <i>bhejna</i> hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Policy ka structure">
<rect x="20" y="70" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="90" y="95" text-anchor="middle" class="svg-ink" font-size="13">inet.0</text><text x="90" y="113" text-anchor="middle" class="svg-muted" font-size="12">saare routes</text>
<rect x="230" y="30" width="180" height="140" rx="10" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="14">policy-statement AGG-OUT</text>
<text x="245" y="85" class="svg-ink" font-size="12">term 1</text><text x="255" y="105" class="svg-ink" font-size="12">from protocol aggregate</text><text x="255" y="123" class="svg-ink" font-size="12">from route-filter ... exact</text><text x="255" y="141" class="svg-ink" font-size="12">then accept</text>
<rect x="480" y="70" width="140" height="60" rx="10" fill="#bae6fd"/><text x="550" y="95" text-anchor="middle" class="svg-ink" font-size="13">OSPF / BGP</text><text x="550" y="113" text-anchor="middle" class="svg-muted" font-size="12">export</text>
<line x1="160" y1="100" x2="230" y2="100" stroke="#64748b" stroke-width="2"/><line x1="410" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Routes policy se guzarte hain; accept hue routes export hote hain.</p></div>

<h3>Policy-statement ka structure</h3>
<pre class="code">set policy-options policy-statement NAME term T1 from ...        <span class="c">! conditions (sab true honi chahiye)</span>
set policy-options policy-statement NAME term T1 then accept      <span class="c">! action</span>
set policy-options policy-statement NAME term T2 then reject</pre>
<ul>
<li>Policy mein ek ya zyada <b>terms</b> hote hain, kram se evaluate hote hain. Jis pehle term ki saari <b>from</b> conditions true hon wahi apne <b>then</b> actions lagata hai.</li>
<li>Jis term mein <code>from</code> nahi hota woh har route match karta hai.</li>
<li><code>accept</code> aur <code>reject</code> policy ko khatam karte hain. Koi term khatam na kare (jaise sirf metric set karne wala term) to router agle term par, phir protocol ki <b>default policy</b> par jaata hai.</li>
<li>OSPF aur BGP exports ke liye jo routes kisi se match na hon unki default policy reject hai (OSPF aur BGP default mein sirf apne protocol ke routes export karte hain). Isi liye jo policy kisi route type ka zikr nahi karti woh uska kuch export nahi karti.</li>
</ul>

<h3>Match conditions</h3>
<table class="cmp"><tr><th>Condition</th><th>Matlab</th></tr>
<tr><td><code>from protocol aggregate | static | direct | bgp | ospf</code></td><td>route ka source</td></tr>
<tr><td><code>from route-filter PREFIX MATCH-TYPE</code></td><td>prefix aur length ka test</td></tr>
<tr><td><code>from interface ge-0/0/1.0</code></td><td>jis interface se route aaya</td></tr>
<tr><td><code>from neighbor ADDRESS</code></td><td>jis neighbour ne advertise kiya</td></tr></table>

<h3>Route-filter match types</h3>
<p>Yeh exam ka favourite topic hai. Prefix <b>10.40.0.0/16</b> ke liye:</p>
<table class="cmp"><tr><th>Type</th><th>Kya match karta hai</th></tr>
<tr><td><code>exact</code></td><td>sirf 10.40.0.0/16</td></tr>
<tr><td><code>orlonger</code></td><td>10.40.0.0/16 aur uske andar ka har more specific (/17, /24, /32 ...)</td></tr>
<tr><td><code>longer</code></td><td>sirf more specific, /16 khud nahi</td></tr>
<tr><td><code>upto /24</code></td><td>/16 se /24 tak (dono shamil)</td></tr>
<tr><td><code>prefix-length-range /20-/24</code></td><td>range ke andar 20 se 24 tak ki lengths</td></tr></table>
<p>Aggregate export karte waqt aap lagbhag hamesha <code>exact</code> chahte ho. <code>orlonger</code> lagate to policy more specific static routes ko bhi match karti, lekin <code>from protocol aggregate</code> bhi likha ho to sirf protocol <code>aggregate</code> wale routes hi match karte hain. Conditions milane se match tang hota hai: ek term ki <b>saari</b> conditions true hone chahiye.</p>

<h3>Policy lagana</h3>
<pre class="code">set protocols ospf export AGG-OUT
set protocols bgp group ISP export AGG-OUT         <span class="c">! BGP ke liye wahi idea</span>
set protocols ospf export [ P1 P2 ]                <span class="c">! chain: left se right evaluate</span></pre>
<p><code>set protocols ospf export</code> statement dobara set karne par policy list mein <i>jodta</i> hai; purani ko replace nahi karta. Purana export (jaise campus lab ka STATICS-OUT) abhi bhi laga ho to dono policies chalti hain. Saaf shuruaat ke liye pehle <code>delete protocols ospf export</code> karo. Change ke baad real output:</p>
<pre class="out">lab@EDGE&gt; show configuration policy-options
policy-statement AGG-OUT {
    term 1 {
        from {
            protocol aggregate;
            route-filter 10.40.0.0/16 exact;
        }
        then {
            accept;
        }
    }
}

lab@EDGE&gt; show configuration protocols ospf
area 0.0.0.0 {
    interface ge-0/0/0.0;
    interface lo0.0 {
        passive;
    }
}
<span class="hl">export AGG-OUT;</span></pre>

<h3>Neighbour mein result dekhna</h3>
<p>OSPF mein export hua route <b>external</b> route ban jaata hai: type 5 (AS external) LSA. Receiving router par uski preference 150 hoti hai. Campus lab mein:</p>
<pre class="out">lab@CORE&gt; show ospf database external
 Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len
Extern   10.40.0.0        10.255.0.1       0x80000001    25  0x22 0x58a9  36

lab@CORE&gt; show route 10.40.0.0/16 detail
10.40.0.0/16 (1 entry, 1 announced)
        *OSPF Preference: 150
                Next hop type: Router
                Next hop: 10.0.40.1 via ge-0/0/0.0, selected
                Task: OSPF</pre>
<p>Poori summary ke liye ek LSA, router ID 10.255.0.1 (EDGE) se advertise hua. Change se pehle CORE ko har campus static route ke liye ek LSA milta tha.</p>
<p>Doosre kaam ke tools: BGP exports ke liye <code>show route advertising-protocol bgp NEIGHBOR</code>, neighbour ne kya seekha dekhne ke liye <code>show route protocol ospf</code>, aur <code>test policy NAME PREFIX</code> yeh dekhne ke liye ki table ke kaunse routes policy accept karti hai. Uska result samajhdari se padho: yeh woh sab routes list karta hai jo policy conditions match karte hain, sirf aapka expected route nahi.</p>

<div class="eg"><p><b>Worked example.</b> Aap chahte ho OSPF aggregate 10.40.0.0/16 le jaaye lekin koi static route nahi. Policy: <code>from protocol aggregate</code>, <code>route-filter 10.40.0.0/16 exact</code>, <code>then accept</code>. Static routes protocol condition match nahi karte, isliye default policy mein girte hain jo OSPF ke liye unhe reject karti hai. <code>from protocol static</code> wali policy ulta karti.</p></div>

<div class="warn"><p><b>Common mistake.</b> Aggregate ya generated route export karne ke liye <code>from protocol static</code> likhna. Aggregates aur generated routes protocol <code>aggregate</code> hain. Ek aur trap: naya export statement purane ko delete kiye bina lagana, jisse purani policy abhi bhi har static export karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Paanchon route-filter types (exact, orlonger, longer, upto, prefix-length-range) yaad karo aur yaad rakho ki <code>accept</code> aur <code>reject</code> policy ko terminate karte hain. Policies routing table ke point of view se import ya export hoti hain: export routes ko table <i>se bahar</i> protocol mein bhejta hai.</p></div>

<div class="scn"><h4>Do policies, ek rahasya</h4><p>Summary jodne ke baad bhi core har campus /24 dikha raha tha. Engineer ki nayi policy sahi thi, lekin purana STATICS-OUT export abhi bhi OSPF se laga tha: do policies evaluate ho rahi thi, aur purani statics export karti thi. <code>show configuration protocols ospf</code> ne doosra export statement dikha diya. Use delete karne par core mein sirf aggregate bacha.</p><p><b>Lesson:</b> hamesha lagi hui policies ki final list verify karo, sirf apni likhi policy nahi.</p></div>
<div class="iv"><p class="q">"Aggregate route ko OSPF mein kaise advertise karte ho?"</p><p>Ek policy-statement banao jisme term <code>from protocol aggregate</code> aur summary ke liye exact match wala route-filter ho, phir accept, aur use <code>set protocols ospf export POLICY</code> se lagao. Neighbours mein route OSPF external route ke roop mein preference 150 ke saath dikhta hai. Purani export policies hatane aur OSPF external database check karne ka zikr karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy = ordered terms, from conditions aur then actions; pehla match jeetta hai.</li>
<li>Aggregate aur generated routes <code>from protocol aggregate</code> match karte hain.</li>
<li>Route-filter types: exact, orlonger, longer, upto, prefix-length-range.</li>
<li>Export policies protocol ke neeche lagti hain; set jodta hai, isliye purani delete karo.</li>
<li>OSPF exports type 5 external routes ke roop mein dikhte hain, preference 150.</li>
</ul></div>
`}};export{e as default};