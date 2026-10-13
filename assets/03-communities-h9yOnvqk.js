var e={id:`communities`,h:{en:`Communities: standard, well-known, extended and large`,hi:`Communities: standard, well-known, extended aur large`},body:{en:`
<p>A BGP <b>community</b> is a tag attached to a route. It is an optional transitive attribute, so it travels with the route across ASes (Junos sends communities to every peer by default). A router that never heard of the prefix can still act on the tag: "drop it", "set local preference 200", "do not advertise to peers". That is why large networks run their whole policy on communities instead of prefix lists.</p>

<h3>Four kinds of community</h3>
<table class="cmp"><tr><th>Type</th><th>Size and format</th><th>Typical use</th></tr>
<tr><td>Standard</td><td>32 bits, written <code>AS:value</code>, e.g. <code>65200:100</code></td><td>Tag customer, peer, upstream, region</td></tr>
<tr><td>Well-known</td><td>Reserved values with fixed meaning</td><td><code>no-export</code>, <code>no-advertise</code>, <code>no-export-subconfed</code></td></tr>
<tr><td>Extended</td><td>64 bits with a type, e.g. <code>target:65200:10</code></td><td>VPN route targets, bandwidth</td></tr>
<tr><td>Large (RFC 8092)</td><td>96 bits: global admin : data1 : data2, e.g. <code>large:65200:1:100</code></td><td>Same as standard but works with 4-byte AS numbers</td></tr></table>
<p>The standard community has only 16 bits for the AS part, so it cannot hold a 4-byte AS. Large communities fix that. Extended and large communities are explained here for the exam; this module's labs use standard and well-known ones.</p>

<h3>Well-known communities</h3>
<ul>
<li><code>no-export</code>: do not advertise outside the AS (or outside the confederation).</li>
<li><code>no-advertise</code>: do not advertise to any BGP peer at all.</li>
<li><code>no-export-subconfed</code>: do not advertise to any EBGP peer, including peers in other member ASes of a confederation.</li>
</ul>

<h3>Defining and using communities on Junos</h3>
<p>A community is first <b>named</b> under <code>policy-options</code>, then <b>matched</b> in a <code>from</code> clause or <b>changed</b> in a <code>then</code> clause.</p>
<pre class="code"><span class="c"># define</span>
set policy-options community CUSTOMER members 65200:100
set policy-options community UPSTREAM members 65200:300
set policy-options community ANY-200 members "65200:.*"          <span class="c"># regular expression</span>
<span class="c"># change in a then clause</span>
set policy-options policy-statement CUST-IN term 1 then community add CUSTOMER
set policy-options policy-statement X term 1 then community set CUSTOMER
set policy-options policy-statement X term 2 then community delete ANY-200
<span class="c"># match in a from clause</span>
set policy-options policy-statement PEER-OUT term CUST from community CUSTOMER</pre>
<ul>
<li><code>community add</code> keeps the tags already on the route and adds yours.</li>
<li><code>community set</code> <b>replaces every tag</b>. It silently removes a customer's <code>no-export</code>, which can leak a route you promised to keep private.</li>
<li><code>community delete</code> removes the tags that match; a regular expression makes it easy to strip all your own tags at the edge.</li>
</ul>
<p>When a <code>from community</code> names a community with several members, the route must carry <b>all</b> of them. To match any of several tags, list the communities as separate names in the policy, for example <code>from community [ A B ]</code>, which means A or B.</p>

<h3>Seeing communities</h3>
<p>In the community lab R1 tags customer routes with CUSTOMER (65200:100). These commands were run on R2 after the policies were applied:</p>
<pre class="out">lab@R2&gt; show route community-name CUSTOMER
inet.0: 12 destinations, 12 routes (12 active, 0 holddown, 0 hidden)

10.60.1.0/24       *[BGP/170] 00:00:50, localpref 200, from 10.200.255.1
                      AS path: 64512 I, validation-state: unverified
                    &gt;  to 10.200.12.1 via ge-0/0/2.0
10.60.2.0/24       *[BGP/170] 00:00:50, localpref 200, from 10.200.255.1
10.60.99.0/24      *[BGP/170] 00:00:50, localpref 200, from 10.200.255.1

lab@R2&gt; show route community no-export
10.60.99.0/24      *[BGP/170] 00:00:50, localpref 200, from 10.200.255.1</pre>
<p>Use <code>show route community 65200:100</code> to match by value and <code>show route detail</code> to see the <code>Communities:</code> line on a single route.</p>

<div class="eg"><p><b>Worked example.</b> The customer route 10.60.99.0/24 arrives with <code>no-export</code> already set. R1 applies <code>community add CUSTOMER</code>, so the route now carries <code>no-export</code> and <code>65200:100</code>. Had R1 used <code>community set CUSTOMER</code>, <code>no-export</code> would have vanished and the prefix would be announced to the Internet.</p></div>

<div class="warn"><p><b>Common mistake.</b> Defining a community on one router and forgetting it on the other. A policy that references an undefined community fails to commit, but a community defined with a different value silently never matches. Keep one shared community plan.</p></div>
<div class="exam"><p><b>Exam trap.</b> Communities are optional <i>transitive</i>, but a router must be configured to send them on some platforms; Junos sends them by default. <code>set</code> replaces, <code>add</code> appends. A well-known community such as <code>no-export</code> is honoured only if you do not delete it.</p></div>

<div class="scn"><h4>The community that went missing</h4><p>An ISP asked customers to tag routes with <code>no-export</code> when they wanted them kept inside the ISP. After a policy rewrite, customer prefixes began to appear at peers. The new import policy used <code>community set CUSTOMER</code>. Changing it to <code>community add CUSTOMER</code> restored the customer's own tags and the leaks stopped.</p><p><b>Lesson:</b> use add unless you deliberately want to wipe the customer's tags, and document which communities you honour.</p></div>

<div class="iv"><p class="q">"What is the difference between community add, set and delete?"</p><p>Add appends to the existing community list, set replaces the whole list, delete removes matching entries. Give the no-export example to show why set can be dangerous, and mention that regular expressions in the community definition let delete clear a whole range of your own tags.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A community is an optional transitive tag; standard communities are AS:value.</li>
<li>Well-known communities are no-export, no-advertise and no-export-subconfed.</li>
<li>Large communities carry 4-byte AS numbers; extended communities carry route targets.</li>
<li>Use community add to keep existing tags; set replaces all tags.</li>
<li>Verify with show route community, community-name and show route detail.</li>
</ul></div>
`,hi:`
<p>BGP <b>community</b> route par laga hua tag hai. Yeh optional transitive attribute hai, isliye route ke saath ASes ke paar travel karta hai (Junos default mein har peer ko communities bhejta hai). Jis router ne prefix kabhi suna hi nahi woh bhi tag par action le sakta hai: "ise drop karo", "local preference 200 set karo", "peers ko advertise mat karo". Isiliye bade networks apni poori policy prefix lists ki jagah communities par chalate hain.</p>

<h3>Community ke chaar types</h3>
<table class="cmp"><tr><th>Type</th><th>Size aur format</th><th>Typical use</th></tr>
<tr><td>Standard</td><td>32 bits, <code>AS:value</code> likha jaata hai, jaise <code>65200:100</code></td><td>Customer, peer, upstream, region tag karna</td></tr>
<tr><td>Well-known</td><td>Fixed matlab wali reserved values</td><td><code>no-export</code>, <code>no-advertise</code>, <code>no-export-subconfed</code></td></tr>
<tr><td>Extended</td><td>Type ke saath 64 bits, jaise <code>target:65200:10</code></td><td>VPN route targets, bandwidth</td></tr>
<tr><td>Large (RFC 8092)</td><td>96 bits: global admin : data1 : data2, jaise <code>large:65200:1:100</code></td><td>Standard jaisa, lekin 4-byte AS numbers ke saath chalta hai</td></tr></table>
<p>Standard community mein AS hisse ke liye sirf 16 bits hain, isliye woh 4-byte AS nahi rakh sakta. Large communities yeh fix karti hain. Extended aur large communities exam ke liye yahan samjhayi gayi hain; is module ke labs standard aur well-known use karte hain.</p>

<h3>Well-known communities</h3>
<ul>
<li><code>no-export</code>: AS ke bahar (ya confederation ke bahar) advertise mat karo.</li>
<li><code>no-advertise</code>: kisi bhi BGP peer ko advertise mat karo.</li>
<li><code>no-export-subconfed</code>: kisi bhi EBGP peer ko advertise mat karo, confederation ke doosre member ASes ke peers ko bhi nahi.</li>
</ul>

<h3>Junos par communities define aur use karna</h3>
<p>Community pehle <code>policy-options</code> mein <b>naam</b> paati hai, phir <code>from</code> clause mein <b>match</b> hoti hai ya <code>then</code> clause mein <b>badli</b> jaati hai.</p>
<pre class="code"><span class="c"># define</span>
set policy-options community CUSTOMER members 65200:100
set policy-options community UPSTREAM members 65200:300
set policy-options community ANY-200 members "65200:.*"          <span class="c"># regular expression</span>
<span class="c"># then clause mein badlo</span>
set policy-options policy-statement CUST-IN term 1 then community add CUSTOMER
set policy-options policy-statement X term 1 then community set CUSTOMER
set policy-options policy-statement X term 2 then community delete ANY-200
<span class="c"># from clause mein match karo</span>
set policy-options policy-statement PEER-OUT term CUST from community CUSTOMER</pre>
<ul>
<li><code>community add</code> route par pehle se maujood tags rakhta hai aur aapka tag jodta hai.</li>
<li><code>community set</code> <b>har tag badal deta hai</b>. Yeh customer ka <code>no-export</code> chupchaap hata deta hai, jisse woh route leak ho sakta hai jise private rakhne ka vaada tha.</li>
<li><code>community delete</code> match hone wale tags hataata hai; regular expression se edge par apne saare tags aasani se hataye ja sakte hain.</li>
</ul>
<p>Jab <code>from community</code> aisi community ka naam leta hai jisme kai members hain, route par <b>sabhi</b> members hone chahiye. Kai tags mein se koi bhi match karne ke liye communities ko alag naam ki tarah likho, jaise <code>from community [ A B ]</code>, jiska matlab A ya B hai.</p>

<h3>Communities dekhna</h3>
<p>Community lab mein R1 customer routes par CUSTOMER (65200:100) tag lagata hai. Yeh commands policies lagne ke baad R2 par chalaye gaye:</p>
<pre class="out">lab@R2&gt; show route community-name CUSTOMER
inet.0: 12 destinations, 12 routes (12 active, 0 holddown, 0 hidden)

10.60.1.0/24       *[BGP/170] 00:00:50, localpref 200, from 10.200.255.1
                      AS path: 64512 I, validation-state: unverified
                    &gt;  to 10.200.12.1 via ge-0/0/2.0
10.60.2.0/24       *[BGP/170] 00:00:50, localpref 200, from 10.200.255.1
10.60.99.0/24      *[BGP/170] 00:00:50, localpref 200, from 10.200.255.1

lab@R2&gt; show route community no-export
10.60.99.0/24      *[BGP/170] 00:00:50, localpref 200, from 10.200.255.1</pre>
<p>Value se match karne ke liye <code>show route community 65200:100</code> use karo, aur ek route par <code>Communities:</code> line dekhne ke liye <code>show route detail</code>.</p>

<div class="eg"><p><b>Worked example.</b> Customer route 10.60.99.0/24 pehle se <code>no-export</code> ke saath aata hai. R1 <code>community add CUSTOMER</code> lagata hai, isliye route ab <code>no-export</code> aur <code>65200:100</code> dono rakhta hai. Agar R1 <code>community set CUSTOMER</code> use karta, to <code>no-export</code> gayab ho jaata aur prefix Internet ko announce ho jaata.</p></div>

<div class="warn"><p><b>Common mistake.</b> Community ek router par define karna aur doosre par bhool jaana. Undefined community reference karne wali policy commit nahi hoti, lekin alag value ke saath define ki gayi community chupchaap kabhi match nahi hoti. Ek shared community plan rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Communities optional <i>transitive</i> hain, lekin kuch platforms par router ko unhe bhejne ke liye configure karna padta hai; Junos default mein bhejta hai. <code>set</code> replace karta hai, <code>add</code> jodta hai. <code>no-export</code> jaisi well-known community tabhi maani jaati hai jab aap use delete na karo.</p></div>

<div class="scn"><h4>Gayab ho gayi community</h4><p>Ek ISP ne customers se kaha ki jo routes ISP ke andar rakhne hon unhe <code>no-export</code> se tag karo. Policy rewrite ke baad customer prefixes peers par dikhne lage. Nayi import policy <code>community set CUSTOMER</code> use karti thi. Use <code>community add CUSTOMER</code> karne se customer ke apne tags wapas aaye aur leaks band ho gaye.</p><p><b>Lesson:</b> jab tak customer ke tags jaanboojhkar mitane na hon, add use karo, aur document karo ki aap kaunsi communities honour karte ho.</p></div>

<div class="iv"><p class="q">"community add, set aur delete mein kya difference hai?"</p><p>Add maujooda community list mein jodta hai, set poori list badal deta hai, delete match hone wali entries hataata hai. no-export ka example do jisse dikhe ki set khatarnak kyun ho sakta hai, aur batao ki community definition mein regular expression se delete apne tags ki poori range saaf kar sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Community optional transitive tag hai; standard communities AS:value hoti hain.</li>
<li>Well-known communities no-export, no-advertise aur no-export-subconfed hain.</li>
<li>Large communities 4-byte AS numbers carry karti hain; extended communities route targets.</li>
<li>Maujooda tags rakhne ke liye community add; set saare tags badalta hai.</li>
<li>show route community, community-name aur show route detail se verify karo.</li>
</ul></div>
`}};export{e as default};