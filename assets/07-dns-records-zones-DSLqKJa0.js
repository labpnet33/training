var e={id:`records-zones`,h:{en:`DNS records, zones, primary and secondary servers (Lab 2)`,hi:`DNS records, zones, primary aur secondary servers (Lab 2)`},body:{en:`
<p>A company phone book is not just a list of names and numbers. Each line has a type: "desk phone", "mobile", "send post here", "also known as". The book for one department is kept by one secretary, who makes all changes, and photocopies are placed at reception so people can look things up even when she is on leave. In DNS, the lines are <b>resource records</b>, the department's book is a <b>zone</b>, the secretary's copy is the <b>primary</b> and the photocopies are <b>secondaries</b>.</p>

<h3>Record types you must know</h3>
<table class="cmp"><tr><th>Type</th><th>Maps</th><th>Example</th></tr>
<tr><td><b>A</b></td><td>Name → IPv4 address</td><td><code>web.nwk.lab → 10.0.20.10</code></td></tr>
<tr><td><b>AAAA</b></td><td>Name → IPv6 address</td><td><code>web.nwk.lab → 2001:db8:20::10</code></td></tr>
<tr><td><b>CNAME</b></td><td>Alias → canonical (real) name</td><td><code>intranet.nwk.lab → web.nwk.lab</code></td></tr>
<tr><td><b>MX</b></td><td>Domain → mail server name, with a preference</td><td><code>nwk.lab MX 10 mail.nwk.lab</code></td></tr>
<tr><td><b>TXT</b></td><td>Name → free text</td><td>SPF, DKIM, DMARC, domain verification</td></tr>
<tr><td><b>NS</b></td><td>Zone → its authoritative name servers</td><td><code>nwk.lab NS ns1.nwk.lab</code></td></tr>
<tr><td><b>PTR</b></td><td>IP address → name (reverse lookup)</td><td><code>10.20.0.10.in-addr.arpa → web.nwk.lab</code></td></tr>
<tr><td><b>SOA</b></td><td>Start of authority: primary server, admin, serial, timers</td><td>One per zone</td></tr>
<tr><td><b>SRV</b></td><td>Service → host and port</td><td>Where to find LDAP, SIP, Kerberos</td></tr>
</table>
<p>A few rules that trip people up: an <b>MX</b> record points to a <b>name</b>, never directly to an IP address, and a lower preference number is tried first. A <b>CNAME</b> cannot sit at the top (apex) of a zone next to SOA and NS records. <b>TXT</b> records are how email anti-spoofing works: SPF lists which servers may send mail for the domain.</p>

<h3>Zones: forward and reverse</h3>
<p>A <b>forward lookup zone</b> answers "what is the address of this name?" (A, AAAA, CNAME, MX...). A <b>reverse lookup zone</b> answers "what is the name of this address?" using PTR records. Reverse zones live under special domains: <code>in-addr.arpa</code> for IPv4 (octets written backwards) and <code>ip6.arpa</code> for IPv6 (each hex digit written backwards). Reverse lookups are used by logging tools, <code>traceroute</code> output, and mail servers checking that a sender looks legitimate.</p>
<pre class="code"><span class="c">; forward zone nwk.lab (BIND-style zone file)</span>
@        IN SOA  ns1.nwk.lab. hostmaster.nwk.lab. (2026030101 7200 900 1209600 300)
@        IN NS   ns1.nwk.lab.
@        IN MX   10 mail.nwk.lab.
ns1      IN A    10.0.20.53
web      IN A    10.0.20.10
files    IN A    10.0.20.10
intranet IN CNAME web.nwk.lab.
<span class="c">; reverse zone 20.0.10.in-addr.arpa</span>
10       IN PTR  web.nwk.lab.</pre>

<h3>Primary and secondary servers, zone transfers</h3>
<p>The <b>primary</b> server holds the writable copy of the zone; all changes are made there. <b>Secondary</b> servers hold read-only copies and answer queries authoritatively too, which gives redundancy and spreads load. The secondary checks the <b>serial number</b> in the SOA record every <i>refresh</i> interval; if the primary's serial is higher, it pulls a <b>zone transfer</b>: a full transfer (<b>AXFR</b>) or only the changes (<b>IXFR</b>). Zone transfers use <b>TCP 53</b> and should be restricted to known secondaries, because a full zone transfer reveals every name in your network.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Primary and secondary DNS">
<rect x="20" y="50" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="75" text-anchor="middle" class="svg-ink" font-size="14">Primary ns1</text><text x="110" y="95" text-anchor="middle" class="svg-muted" font-size="12">read-write, serial 2026030101</text>
<rect x="440" y="50" width="180" height="60" rx="8" fill="#bae6fd"/><text x="530" y="75" text-anchor="middle" class="svg-ink" font-size="14">Secondary ns2</text><text x="530" y="95" text-anchor="middle" class="svg-muted" font-size="12">read-only copy</text>
<line x1="200" y1="80" x2="440" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="70" text-anchor="middle" class="svg-accent" font-size="13">zone transfer AXFR/IXFR, TCP 53</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">both answer queries authoritatively</text>
</svg><p class="cap">The secondary copies the zone when the SOA serial increases. Both servers are authoritative.</p></div>

<h3>Lab 2: turn R1 into the office DNS server</h3>
<p>In the lab, staff should reach the intranet server SRV (10.0.20.10) by name. A router can act as a small DNS server that answers from its own host table.</p>
<pre class="code"><span class="c">! On R1: answer DNS queries and add two static A records</span>
ip dns server
ip host web.nwk.lab 10.0.20.10
ip host files.nwk.lab 10.0.20.10
end
show hosts</pre>
<pre class="out">R1# show hosts
Default domain is not set
Name/address lookup uses domain service
Name servers are 255.255.255.255

Codes: UN - unknown, EX - expired, OK - OK, ?? - revalidate
       temp - temporary, perm - permanent
       NA - Not Applicable None - Not defined

Host                      Port  Flags      Age Type   Address(es)
<span class="hl">files.nwk.lab             None  (perm, OK)  0   IP    10.0.20.10</span>
<span class="hl">web.nwk.lab               None  (perm, OK)  0   IP    10.0.20.10</span></pre>
<p>"perm" means a permanent, manually configured entry; learned entries would show "temp". Then point both PCs at R1 and test:</p>
<pre class="code"><span class="c">! On PC1 and PC2</span>
ip dns 192.168.10.1
nslookup web.nwk.lab
<span class="c">! On PC1: use the name with other tools</span>
ping files.nwk.lab
curl web.nwk.lab</pre>
<pre class="out">PC1&gt; nslookup web.nwk.lab
Server:		192.168.10.1
Address:	192.168.10.1#53

Name:	web.nwk.lab
<span class="hl">Address: 10.0.20.10</span></pre>
<p>The lab's last question asks which record type <code>ip host</code> created. It maps a name to an IPv4 address, so it is an <b>A</b> record.</p>

<div class="eg"><p><b>Worked example: build a reverse name.</b> What PTR name holds the reverse record for 10.0.20.10? Write the four octets backwards (10.20.0.10) and add <code>.in-addr.arpa</code>: <code>10.20.0.10.in-addr.arpa</code>. In a reverse zone for 10.0.20.0/24 (zone name <code>20.0.10.in-addr.arpa</code>) the record is simply <code>10 IN PTR web.nwk.lab.</code></p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Editing the zone on the primary but forgetting to increase the SOA serial, so secondaries never pull the change. (2) Creating an A record but no PTR, so logs and traceroutes show only numbers. (3) Pointing an MX record at a CNAME or an IP address.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match the record to the job: IPv6 address is <b>AAAA</b>, reverse lookup is <b>PTR</b>, mail is <b>MX</b>, alias is <b>CNAME</b>, SPF lives in <b>TXT</b>, delegation uses <b>NS</b>. Secondary servers get their data through zone transfers on TCP 53.</p></div>

<div class="scn"><h4>Mail rejected by partners</h4><p>A company moved its outbound mail to a new server. Soon partners started rejecting their mail as spam. The engineer checked the domain's TXT record: the SPF entry still listed only the old mail server's address, and the new server had no PTR record. Receiving servers saw mail from an address that was neither allowed by SPF nor had a matching reverse name. Updating the SPF TXT record and asking the ISP to create the PTR fixed delivery within an hour (the TTL).</p><p><b>Lesson:</b> DNS is not only for finding websites; MX, TXT and PTR records decide whether your email is trusted.</p></div>

<div class="iv"><p class="q">"What is the difference between a primary and a secondary DNS server?"</p><p>Strong answer: the primary holds the master, writable copy of the zone; administrators make changes there. The secondary holds a read-only copy obtained by zone transfer (AXFR full or IXFR incremental over TCP 53), triggered when the SOA serial increases. Both answer queries authoritatively, so the secondary adds redundancy and load sharing. Mention restricting zone transfers to known secondaries for security.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A = IPv4, AAAA = IPv6, CNAME = alias, MX = mail, TXT = text/SPF, NS = name servers, PTR = reverse, SOA = zone authority.</li>
<li>Forward zones map names to addresses; reverse zones (in-addr.arpa, ip6.arpa) map addresses to names.</li>
<li>Primary = writable master; secondary = read-only copy via zone transfer on TCP 53.</li>
<li>Increase the SOA serial after every change.</li>
<li>Lab 2: <code>ip dns server</code> + <code>ip host</code> on R1, <code>ip dns</code> + <code>nslookup</code> on the PCs.</li>
</ul></div>
`,hi:`
<p>Company ki phone book sirf names aur numbers ki list nahi hoti. Har line ka ek type hota hai: "desk phone", "mobile", "post yahan bhejo", "ise yeh bhi kehte hain". Ek department ki book ek secretary rakhti hai, jo saare changes karti hai, aur uski photocopies reception par rakhi jaati hain taaki uske chhutti par hone par bhi log cheezein dekh sakein. DNS mein lines <b>resource records</b> hain, department ki book ek <b>zone</b> hai, secretary ki copy <b>primary</b> hai aur photocopies <b>secondaries</b> hain.</p>

<h3>Record types jo pata hone chahiye</h3>
<table class="cmp"><tr><th>Type</th><th>Kya map karta hai</th><th>Example</th></tr>
<tr><td><b>A</b></td><td>Naam → IPv4 address</td><td><code>web.nwk.lab → 10.0.20.10</code></td></tr>
<tr><td><b>AAAA</b></td><td>Naam → IPv6 address</td><td><code>web.nwk.lab → 2001:db8:20::10</code></td></tr>
<tr><td><b>CNAME</b></td><td>Alias → canonical (asli) naam</td><td><code>intranet.nwk.lab → web.nwk.lab</code></td></tr>
<tr><td><b>MX</b></td><td>Domain → mail server naam, preference ke saath</td><td><code>nwk.lab MX 10 mail.nwk.lab</code></td></tr>
<tr><td><b>TXT</b></td><td>Naam → free text</td><td>SPF, DKIM, DMARC, domain verification</td></tr>
<tr><td><b>NS</b></td><td>Zone → uske authoritative name servers</td><td><code>nwk.lab NS ns1.nwk.lab</code></td></tr>
<tr><td><b>PTR</b></td><td>IP address → naam (reverse lookup)</td><td><code>10.20.0.10.in-addr.arpa → web.nwk.lab</code></td></tr>
<tr><td><b>SOA</b></td><td>Start of authority: primary server, admin, serial, timers</td><td>Har zone mein ek</td></tr>
<tr><td><b>SRV</b></td><td>Service → host aur port</td><td>LDAP, SIP, Kerberos kahan milenge</td></tr>
</table>
<p>Kuch rules jin par log atakte hain: <b>MX</b> record ek <b>naam</b> ko point karta hai, kabhi seedha IP address ko nahi, aur kam preference number pehle try hota hai. <b>CNAME</b> zone ke top (apex) par SOA aur NS records ke saath nahi baith sakta. <b>TXT</b> records se email anti-spoofing kaam karta hai: SPF list karta hai ki kaunse servers domain ke liye mail bhej sakte hain.</p>

<h3>Zones: forward aur reverse</h3>
<p><b>Forward lookup zone</b> jawab deta hai "is naam ka address kya hai?" (A, AAAA, CNAME, MX...). <b>Reverse lookup zone</b> PTR records se jawab deta hai "is address ka naam kya hai?". Reverse zones special domains ke neeche rehte hain: IPv4 ke liye <code>in-addr.arpa</code> (octets ulte likhe hue) aur IPv6 ke liye <code>ip6.arpa</code> (har hex digit ulta likha hua). Reverse lookups logging tools, <code>traceroute</code> output, aur mail servers use karte hain jo check karte hain ki sender legitimate dikhta hai.</p>
<pre class="code"><span class="c">; forward zone nwk.lab (BIND-style zone file)</span>
@        IN SOA  ns1.nwk.lab. hostmaster.nwk.lab. (2026030101 7200 900 1209600 300)
@        IN NS   ns1.nwk.lab.
@        IN MX   10 mail.nwk.lab.
ns1      IN A    10.0.20.53
web      IN A    10.0.20.10
files    IN A    10.0.20.10
intranet IN CNAME web.nwk.lab.
<span class="c">; reverse zone 20.0.10.in-addr.arpa</span>
10       IN PTR  web.nwk.lab.</pre>

<h3>Primary aur secondary servers, zone transfers</h3>
<p><b>Primary</b> server ke paas zone ki writable copy hoti hai; saare changes wahin hote hain. <b>Secondary</b> servers ke paas read-only copies hoti hain aur woh bhi authoritatively queries ka jawab dete hain, jisse redundancy milti hai aur load bantta hai. Secondary har <i>refresh</i> interval par SOA record ka <b>serial number</b> check karta hai; agar primary ka serial zyada hai, to woh <b>zone transfer</b> kheenchta hai: full transfer (<b>AXFR</b>) ya sirf changes (<b>IXFR</b>). Zone transfers <b>TCP 53</b> use karte hain aur sirf known secondaries tak restricted hone chahiye, kyunki full zone transfer aapke network ka har naam khol deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Primary aur secondary DNS">
<rect x="20" y="50" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="75" text-anchor="middle" class="svg-ink" font-size="14">Primary ns1</text><text x="110" y="95" text-anchor="middle" class="svg-muted" font-size="12">read-write, serial 2026030101</text>
<rect x="440" y="50" width="180" height="60" rx="8" fill="#bae6fd"/><text x="530" y="75" text-anchor="middle" class="svg-ink" font-size="14">Secondary ns2</text><text x="530" y="95" text-anchor="middle" class="svg-muted" font-size="12">read-only copy</text>
<line x1="200" y1="80" x2="440" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="70" text-anchor="middle" class="svg-accent" font-size="13">zone transfer AXFR/IXFR, TCP 53</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">dono authoritatively jawab dete hain</text>
</svg><p class="cap">SOA serial badhne par secondary zone copy karta hai. Dono servers authoritative hain.</p></div>

<h3>Lab 2: R1 ko office DNS server banao</h3>
<p>Lab mein staff ko intranet server SRV (10.0.20.10) naam se kholna chahiye. Router ek chhote DNS server ka kaam kar sakta hai jo apni host table se jawab deta hai.</p>
<pre class="code"><span class="c">! R1 par: DNS queries ka jawab do aur do static A records add karo</span>
ip dns server
ip host web.nwk.lab 10.0.20.10
ip host files.nwk.lab 10.0.20.10
end
show hosts</pre>
<pre class="out">R1# show hosts
Default domain is not set
Name/address lookup uses domain service
Name servers are 255.255.255.255

Codes: UN - unknown, EX - expired, OK - OK, ?? - revalidate
       temp - temporary, perm - permanent
       NA - Not Applicable None - Not defined

Host                      Port  Flags      Age Type   Address(es)
<span class="hl">files.nwk.lab             None  (perm, OK)  0   IP    10.0.20.10</span>
<span class="hl">web.nwk.lab               None  (perm, OK)  0   IP    10.0.20.10</span></pre>
<p>"perm" ka matlab permanent, manually configured entry; seekhi hui entries "temp" dikhati. Phir dono PCs ko R1 par point karo aur test karo:</p>
<pre class="code"><span class="c">! PC1 aur PC2 par</span>
ip dns 192.168.10.1
nslookup web.nwk.lab
<span class="c">! PC1 par: naam ko doosre tools ke saath use karo</span>
ping files.nwk.lab
curl web.nwk.lab</pre>
<pre class="out">PC1&gt; nslookup web.nwk.lab
Server:		192.168.10.1
Address:	192.168.10.1#53

Name:	web.nwk.lab
<span class="hl">Address: 10.0.20.10</span></pre>
<p>Lab ka aakhri sawaal poochta hai ki <code>ip host</code> ne kaunsa record type banaya. Yeh naam ko IPv4 address se map karta hai, to yeh <b>A</b> record hai.</p>

<div class="eg"><p><b>Worked example: reverse naam banao.</b> 10.0.20.10 ka reverse record kaunse PTR naam mein hai? Chaaron octets ulte likho (10.20.0.10) aur <code>.in-addr.arpa</code> jodo: <code>10.20.0.10.in-addr.arpa</code>. 10.0.20.0/24 ke reverse zone (zone naam <code>20.0.10.in-addr.arpa</code>) mein record simply <code>10 IN PTR web.nwk.lab.</code> hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Primary par zone edit karna lekin SOA serial badhana bhool jaana, jisse secondaries kabhi change nahi kheenchte. (2) A record banana lekin PTR nahi, jisse logs aur traceroutes sirf numbers dikhate hain. (3) MX record ko CNAME ya IP address par point karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Record ko kaam se match karo: IPv6 address <b>AAAA</b>, reverse lookup <b>PTR</b>, mail <b>MX</b>, alias <b>CNAME</b>, SPF <b>TXT</b> mein, delegation <b>NS</b> se. Secondary servers apna data TCP 53 par zone transfers se paate hain.</p></div>

<div class="scn"><h4>Partners ne mail reject kiya</h4><p>Ek company ne apna outbound mail naye server par move kiya. Jaldi hi partners unke mail ko spam maan kar reject karne lage. Engineer ne domain ka TXT record check kiya: SPF entry mein abhi bhi sirf purane mail server ka address tha, aur naye server ka koi PTR record nahi tha. Receiving servers ko aise address se mail dikh raha tha jo na SPF se allowed tha na uska matching reverse naam tha. SPF TXT record update karne aur ISP se PTR banwane se ek ghante (TTL) mein delivery theek ho gayi.</p><p><b>Seekh:</b> DNS sirf websites dhoondhne ke liye nahi hai; MX, TXT aur PTR records tay karte hain ki aapke email par bharosa kiya jaaye ya nahi.</p></div>

<div class="iv"><p class="q">"Primary aur secondary DNS server mein kya farak hai?"</p><p>Strong answer: primary ke paas zone ki master, writable copy hoti hai; administrators changes wahin karte hain. Secondary ke paas zone transfer (AXFR full ya IXFR incremental, TCP 53 par) se mili read-only copy hoti hai, jo SOA serial badhne par trigger hota hai. Dono authoritatively queries ka jawab dete hain, to secondary redundancy aur load sharing deta hai. Security ke liye zone transfers ko known secondaries tak restrict karne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A = IPv4, AAAA = IPv6, CNAME = alias, MX = mail, TXT = text/SPF, NS = name servers, PTR = reverse, SOA = zone authority.</li>
<li>Forward zones names ko addresses se map karte hain; reverse zones (in-addr.arpa, ip6.arpa) addresses ko names se.</li>
<li>Primary = writable master; secondary = TCP 53 par zone transfer se read-only copy.</li>
<li>Har change ke baad SOA serial badhao.</li>
<li>Lab 2: R1 par <code>ip dns server</code> + <code>ip host</code>, PCs par <code>ip dns</code> + <code>nslookup</code>.</li>
</ul></div>
`}};export{e as default};