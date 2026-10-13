var e={id:`dns-rules`,h:{en:`DNS rules: internal domains and the cloud default`,hi:`DNS rules: internal domains aur cloud default`},body:{en:`
<p>A tunnel without working DNS is useless. If a user types <code>app.corp.example</code> and the name cannot be resolved, the tunnel is up but nothing opens. Prisma Access lets you decide which DNS servers answer which names. This chapter explains those rules, which are the focus of lab <b>pa-mobile-2</b>.</p>

<h3>Analogy: a switchboard with two directories</h3>
<p>Imagine a receptionist with two phone directories: the internal staff directory and the public telephone book. If a caller asks for "Accounts, extension 21", she looks in the internal one. If the caller wants a pizza shop, she looks in the public one. A DNS rule is the instruction that tells her which book to open for which name.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="DNS decision">
<rect x="20" y="75" width="140" height="56" rx="8" fill="#bae6fd"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="12">Client asks:</text><text x="90" y="118" text-anchor="middle" class="svg-muted" font-size="11">app.corp.example</text>
<rect x="230" y="75" width="150" height="56" rx="8" fill="#ddd6fe"/><text x="305" y="100" text-anchor="middle" class="svg-ink" font-size="12">Domain match?</text><text x="305" y="118" text-anchor="middle" class="svg-muted" font-size="11">*.corp.example</text>
<rect x="460" y="20" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="540" y="45" text-anchor="middle" class="svg-ink" font-size="12">Internal DNS</text><text x="540" y="63" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.53</text>
<rect x="460" y="130" width="160" height="56" rx="8" fill="#fed7aa"/><text x="540" y="155" text-anchor="middle" class="svg-ink" font-size="12">Public rule</text><text x="540" y="173" text-anchor="middle" class="svg-muted" font-size="11">Cloud Default</text>
<line x1="160" y1="103" x2="230" y2="103" stroke="#64748b"/><line x1="380" y1="95" x2="460" y2="55" stroke="#64748b"/><line x1="380" y1="112" x2="460" y2="150" stroke="#64748b"/>
<text x="425" y="75" class="svg-muted" font-size="11">yes</text><text x="425" y="140" class="svg-muted" font-size="11">no</text>
</svg><p class="cap">Names that match an internal domain rule go to your DNS server; other names use the public rule.</p></div>

<h3>The pieces</h3>
<ul>
<li><b>Region:</b> a DNS setting can apply to Worldwide, to a theater, or to a location group.</li>
<li><b>Internal domain rules:</b> a list of domains in the format <code>*.corp.example</code> (up to 1,024 entries), each with a <b>primary</b> and an optional <b>secondary</b> DNS server. In the lab: <code>*.corp.example</code> goes to <code>10.10.0.53</code>.</li>
<li><b>Public domain rules:</b> choose <b>Cloud Default</b>, <b>Same as Internal</b> or <b>Custom</b> for all other names.</li>
<li><b>DNS suffix list:</b> optional; no wildcards allowed.</li>
<li><b>UDP retry:</b> interval and number of attempts.</li>
<li><b>Advanced RCODE support:</b> fail over to the next server on SERVFAIL or REFUSED answers.</li>
</ul>
<p>A predefined cloud default rule already covers <code>*.amazonaws.com</code>, <code>*.aws.amazon.com</code>, <code>*.googleapis.com</code> and <code>*.google.internal</code>. Avoid using <b>127.0.0.1</b> as a DNS server in these rules.</p>
<table class="cmp"><tr><th>Tool</th><th>Path</th></tr>
<tr><td>SCM</td><td>Mobile Users &gt; GlobalProtect &gt; Infrastructure (Internal DNS, network services)</td></tr>
<tr><td>Panorama</td><td>Onboarding &gt; Configure &gt; Network Services tab</td></tr>
</table>
<pre class="out">DNS rules (lab console view)
Region      Domain            Primary      Secondary
Worldwide   *.corp.example    10.10.0.53   (none)
Public names: <span class="hl">Cloud Default</span>
UDP retry   interval 5 s, attempts 2
</pre>

<h3>Verifying from the laptop</h3>
<pre class="out">C:\\&gt; nslookup app.corp.example
Server:   (gateway DNS proxy)
Name:     app.corp.example
Address:  <span class="hl">10.10.0.50</span>

C:\\&gt; nslookup media.example
Name:     media.example
Address:  203.0.113.80
</pre>
<p>The internal name returns the HQ address, and the public name returns a public answer. If the internal name fails, the DNS rule or the route to 10.10.0.53 is the suspect.</p>

<div class="eg"><p><b>Worked example.</b> Staff report that <code>app.corp.example</code> does not open from home, but the IP address 10.10.0.50 does. That proves the tunnel and policy work and points to DNS. The internal domain list had <code>*.corp.exampl</code> (a typo) so the name fell to the public rule and failed. The administrator corrected the entry to <code>*.corp.example</code>, pushed, and the name resolved to 10.10.0.50.</p></div>

<h3>Documenting DNS rules</h3>
<p>Keep a table of every internal domain, its servers and its owner. When a department adds a new internal zone, the table tells you at once whether a rule is needed.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Typos in the domain list. (2) A DNS server in the data center that the tunnel cannot reach because the return route is missing. (3) Using 127.0.0.1 as a server. (4) Putting a wildcard in the DNS suffix list. (5) Adding more than the 1,024 allowed entries.</p></div>
<div class="exam"><p><b>Exam trap.</b> Public domain rules have exactly three modes: Cloud Default, Same as Internal, Custom. Internal domains use the format *.example.com and have primary and secondary servers.</p></div>

<div class="scn"><h4>The ping works but the name does not</h4><p>A user could ping 10.10.0.50 but could not open the HR site by name. The help desk first suspected the firewall. The engineer ran nslookup; it timed out. The internal DNS server 10.10.0.53 was not reachable from the pool, because HQ-FW had no route back to 10.200.0.0/23 for that server. Adding the route fixed DNS and the website opened.</p><p><b>Lesson:</b> a ping to an IP and a lookup of a name test different things. Test both.</p></div>

<div class="iv"><p class="q">"Users connect but cannot open internal sites by name. How do you troubleshoot?"</p><p>Strong answer: test the IP to prove the tunnel and policy; run nslookup to see which server answers; check the internal domain rule and its primary and secondary servers; confirm the route to the DNS server and the return route to the pool; check the push status.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Internal domain rules send matching names to your DNS (*.corp.example to 10.10.0.53).</li>
<li>Public names use Cloud Default, Same as Internal, or Custom.</li>
<li>Up to 1,024 internal domain entries; suffix list has no wildcards.</li>
<li>Avoid 127.0.0.1; RCODE support fails over on SERVFAIL or REFUSED.</li>
<li>Test with IP first, then with names.</li>
</ul></div>
`,hi:`
<p>DNS ke bina tunnel bekaar hai. User <code>app.corp.example</code> type kare aur naam resolve na ho, to tunnel up hai lekin kuch nahi khulta. Prisma Access aapko decide karne deta hai ki kaun se DNS servers kaun se names ka jawab denge. Yeh chapter un rules ko samjhata hai, jo lab <b>pa-mobile-2</b> ka focus hain.</p>

<h3>Analogy: do directories wala switchboard</h3>
<p>Ek receptionist ke paas do phone directories hain: internal staff directory aur public telephone book. Caller "Accounts, extension 21" maange to woh internal wali dekhti hai. Caller pizza shop maange to public wali. DNS rule woh instruction hai jo batati hai ki kis naam ke liye kaunsi book kholni hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="DNS decision">
<rect x="20" y="75" width="140" height="56" rx="8" fill="#bae6fd"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="12">Client poochta hai:</text><text x="90" y="118" text-anchor="middle" class="svg-muted" font-size="11">app.corp.example</text>
<rect x="230" y="75" width="150" height="56" rx="8" fill="#ddd6fe"/><text x="305" y="100" text-anchor="middle" class="svg-ink" font-size="12">Domain match?</text><text x="305" y="118" text-anchor="middle" class="svg-muted" font-size="11">*.corp.example</text>
<rect x="460" y="20" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="540" y="45" text-anchor="middle" class="svg-ink" font-size="12">Internal DNS</text><text x="540" y="63" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.53</text>
<rect x="460" y="130" width="160" height="56" rx="8" fill="#fed7aa"/><text x="540" y="155" text-anchor="middle" class="svg-ink" font-size="12">Public rule</text><text x="540" y="173" text-anchor="middle" class="svg-muted" font-size="11">Cloud Default</text>
<line x1="160" y1="103" x2="230" y2="103" stroke="#64748b"/><line x1="380" y1="95" x2="460" y2="55" stroke="#64748b"/><line x1="380" y1="112" x2="460" y2="150" stroke="#64748b"/>
<text x="425" y="75" class="svg-muted" font-size="11">haan</text><text x="425" y="140" class="svg-muted" font-size="11">nahi</text>
</svg><p class="cap">Internal domain rule se match karne wale names aapke DNS server ko jaate hain; baaki names public rule use karte hain.</p></div>

<h3>Pieces</h3>
<ul>
<li><b>Region:</b> DNS setting Worldwide, ek theater, ya location group par lag sakti hai.</li>
<li><b>Internal domain rules:</b> domains ki list format <code>*.corp.example</code> mein (1,024 entries tak), har ek ke saath <b>primary</b> aur optional <b>secondary</b> DNS server. Lab mein: <code>*.corp.example</code> <code>10.10.0.53</code> ko jaata hai.</li>
<li><b>Public domain rules:</b> baaki saare names ke liye <b>Cloud Default</b>, <b>Same as Internal</b> ya <b>Custom</b> chuno.</li>
<li><b>DNS suffix list:</b> optional; wildcards allowed nahi.</li>
<li><b>UDP retry:</b> interval aur attempts ki sankhya.</li>
<li><b>Advanced RCODE support:</b> SERVFAIL ya REFUSED answers par agle server par fail over.</li>
</ul>
<p>Predefined cloud default rule pehle se <code>*.amazonaws.com</code>, <code>*.aws.amazon.com</code>, <code>*.googleapis.com</code> aur <code>*.google.internal</code> cover karti hai. In rules mein DNS server ke roop mein <b>127.0.0.1</b> avoid karo.</p>
<table class="cmp"><tr><th>Tool</th><th>Path</th></tr>
<tr><td>SCM</td><td>Mobile Users &gt; GlobalProtect &gt; Infrastructure (Internal DNS, network services)</td></tr>
<tr><td>Panorama</td><td>Onboarding &gt; Configure &gt; Network Services tab</td></tr>
</table>
<pre class="out">DNS rules (lab console view)
Region      Domain            Primary      Secondary
Worldwide   *.corp.example    10.10.0.53   (none)
Public names: <span class="hl">Cloud Default</span>
UDP retry   interval 5 s, attempts 2
</pre>

<h3>Laptop se verify karna</h3>
<pre class="out">C:\\&gt; nslookup app.corp.example
Server:   (gateway DNS proxy)
Name:     app.corp.example
Address:  <span class="hl">10.10.0.50</span>

C:\\&gt; nslookup media.example
Name:     media.example
Address:  203.0.113.80
</pre>
<p>Internal naam HQ address deta hai, aur public naam public answer. Internal naam fail ho to DNS rule ya 10.10.0.53 tak route par shak karo.</p>

<div class="eg"><p><b>Worked example.</b> Staff bolte hain ki <code>app.corp.example</code> ghar se nahi khulta, lekin IP address 10.10.0.50 khulta hai. Isse sabit hota hai ki tunnel aur policy kaam karte hain aur DNS ki taraf ishara hai. Internal domain list mein <code>*.corp.exampl</code> (typo) tha, isliye naam public rule par gaya aur fail hua. Administrator ne entry <code>*.corp.example</code> theek ki, push kiya, aur naam 10.10.0.50 par resolve hone laga.</p></div>

<h3>DNS rules document karna</h3>
<p>Har internal domain, uske servers aur owner ki ek table rakho. Jab koi department naya internal zone jodta hai, table turant batati hai ki rule chahiye ya nahi.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Domain list mein typos. (2) Data center ka DNS server jise tunnel reach nahi kar sakta kyunki return route missing hai. (3) 127.0.0.1 ko server ki tarah use karna. (4) DNS suffix list mein wildcard daalna. (5) 1,024 allowed entries se zyada add karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Public domain rules ke exactly teen modes hain: Cloud Default, Same as Internal, Custom. Internal domains *.example.com format use karte hain aur unke primary aur secondary servers hote hain.</p></div>

<div class="scn"><h4>Ping chalti hai lekin naam nahi</h4><p>Ek user 10.10.0.50 ko ping kar sakta tha lekin HR site naam se nahi khol paata tha. Help desk ne pehle firewall par shak kiya. Engineer ne nslookup chalaya; timeout hua. Internal DNS server 10.10.0.53 pool se reachable nahi tha, kyunki HQ-FW ke paas us server ke liye 10.200.0.0/23 ka return route nahi tha. Route add karne se DNS theek hua aur website khul gayi.</p><p><b>Seekh:</b> IP par ping aur naam ki lookup alag cheezein test karte hain. Dono test karo.</p></div>

<div class="iv"><p class="q">"Users connect hote hain lekin internal sites naam se nahi khulti. Kaise troubleshoot karoge?"</p><p>Strong answer: tunnel aur policy sabit karne ke liye IP test karo; nslookup chalakar dekho kaunsa server jawab deta hai; internal domain rule aur uske primary aur secondary servers check karo; DNS server tak route aur pool tak return route confirm karo; push status check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Internal domain rules matching names ko aapke DNS par bhejte hain (*.corp.example se 10.10.0.53).</li>
<li>Public names Cloud Default, Same as Internal, ya Custom use karte hain.</li>
<li>Internal domain entries 1,024 tak; suffix list mein wildcard nahi.</li>
<li>127.0.0.1 avoid karo; RCODE support SERVFAIL ya REFUSED par fail over karta hai.</li>
<li>Pehle IP se, phir names se test karo.</li>
</ul></div>
`}};export{e as default};