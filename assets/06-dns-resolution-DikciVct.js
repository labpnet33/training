var e={id:`dns-resolution`,h:{en:`DNS: how a name becomes an address`,hi:`DNS: naam address kaise banta hai`},body:{en:`
<p>Suppose you need the phone number of a small shop in another city. First you check your own diary (maybe you wrote it down before). If not, you ask your well-connected friend. Your friend does not know either, so she calls directory enquiries for the country, which tells her which city directory to ring, and that directory gives her the shop's number. She tells you, and both of you write it down for next time. That is the <b>Domain Name System (DNS)</b>: a local file, a helpful resolver, a chain of directories, and caching everywhere.</p>

<h3>Step 0: the hosts file</h3>
<p>Before DNS existed, every computer had a text file listing names and addresses. That file still exists, and by default most operating systems check it <b>before</b> asking DNS:</p>
<ul>
<li>Windows: <code>C:\\Windows\\System32\\drivers\\etc\\hosts</code></li>
<li>Linux and macOS: <code>/etc/hosts</code> (Linux decides the order in <code>/etc/nsswitch.conf</code>, normally "files dns")</li>
</ul>
<pre class="code"><span class="c"># hosts file example: address, then name</span>
127.0.0.1      localhost
10.0.20.10     web.nwk.lab</pre>
<p>The hosts file is handy for testing a new server before its DNS record exists. It is also dangerous: an old entry silently overrides DNS for that one machine, and malware sometimes edits the hosts file to redirect banking sites. Always check it when only <b>one</b> PC resolves a name wrongly.</p>

<h3>The players in a DNS lookup</h3>
<dl class="terms">
<dt>Stub resolver</dt><dd>The small DNS client inside every operating system. It asks one configured DNS server and waits for a final answer.</dd>
<dt>Recursive resolver</dt><dd>The DNS server a client is configured to use (by DHCP option 6). It does the hard work: it chases the answer on the client's behalf and caches it. Examples: the company's internal DNS servers, the ISP's resolvers.</dd>
<dt>Root servers</dt><dd>The top of the tree ("."). They do not know final answers; they know who runs each top-level domain.</dd>
<dt>TLD servers</dt><dd>Servers for top-level domains such as <code>.com</code>, <code>.in</code> or <code>.example</code>. They know which name servers are authoritative for each domain below them.</dd>
<dt>Authoritative server</dt><dd>The server that holds the actual records (the zone) for a domain and gives the definitive answer.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Recursive and iterative DNS">
<rect x="10" y="100" width="100" height="50" rx="8" fill="#bae6fd"/><text x="60" y="130" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="190" y="100" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="255" y="122" text-anchor="middle" class="svg-ink" font-size="13">Recursive</text><text x="255" y="140" text-anchor="middle" class="svg-ink" font-size="13">resolver</text>
<rect x="450" y="10" width="170" height="44" rx="8" fill="#fde68a"/><text x="535" y="37" text-anchor="middle" class="svg-ink" font-size="13">Root server "."</text>
<rect x="450" y="103" width="170" height="44" rx="8" fill="#fed7aa"/><text x="535" y="130" text-anchor="middle" class="svg-ink" font-size="13">TLD server .example</text>
<rect x="450" y="196" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="223" text-anchor="middle" class="svg-ink" font-size="13">Authoritative shop.example</text>
<line x1="110" y1="125" x2="190" y2="125" stroke="#64748b" stroke-width="2"/><text x="150" y="115" text-anchor="middle" class="svg-accent" font-size="12">recursive</text>
<line x1="320" y1="115" x2="450" y2="32" stroke="#64748b"/><line x1="320" y1="125" x2="450" y2="125" stroke="#64748b"/><line x1="320" y1="135" x2="450" y2="218" stroke="#64748b"/>
<text x="385" y="60" text-anchor="middle" class="svg-muted" font-size="12">1</text><text x="385" y="118" text-anchor="middle" class="svg-muted" font-size="12">2</text><text x="385" y="190" text-anchor="middle" class="svg-muted" font-size="12">3</text>
<text x="255" y="185" text-anchor="middle" class="svg-accent" font-size="12">iterative queries 1-2-3</text>
</svg><p class="cap">The client asks one recursive question; the resolver asks the root, the TLD and the authoritative server iteratively, then caches the answer.</p></div>

<h3>Recursive vs iterative queries</h3>
<p>A <b>recursive</b> query says "give me the final answer, or an error". Clients send recursive queries to their resolver. An <b>iterative</b> query says "tell me the best you know"; the answer may be a <b>referral</b> ("I don't know, ask these servers"). The resolver sends iterative queries to the root, then to the TLD, then to the authoritative server.</p>

<h3>Caching and TTL</h3>
<p>Every record carries a <b>TTL</b> (time to live) in seconds, set by the domain owner. The resolver, and the client's own cache, keep the answer for that long. A TTL of 3600 means changes may take up to an hour to be seen everywhere. Before a planned server move, engineers lower the TTL (to 300, say) a day in advance so the change spreads quickly. Negative answers ("this name does not exist") are cached too.</p>

<h3>Authoritative vs non-authoritative answers</h3>
<p>An <b>authoritative</b> answer comes directly from a server that holds the zone; DNS marks it with the <b>AA</b> (authoritative answer) flag. A <b>non-authoritative</b> answer comes from a cache. Both are normally correct; "non-authoritative" simply means "I remembered this from someone else".</p>
<pre class="out">C:\\&gt; nslookup www.shop.example
Server:  dns1.nwk.lab
Address:  192.168.10.1

<span class="hl">Non-authoritative answer:</span>
Name:    www.shop.example
Address:  198.51.100.25</pre>

<div class="eg"><p><b>Worked example.</b> A laptop looks up <code>www.shop.example</code> for the first time today. (1) Hosts file: no entry. (2) Local cache: empty. (3) The stub resolver asks 192.168.10.1 recursively. (4) The resolver asks a root server and gets a referral to the <code>.example</code> TLD servers. (5) The TLD server refers it to <code>ns1.shop.example</code>. (6) The authoritative server answers <code>198.51.100.25</code> with TTL 3600. (7) The resolver caches it and answers the laptop. A second laptop asking one minute later is answered straight from the resolver's cache, non-authoritatively, in about a millisecond.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting the hosts file when one PC behaves differently. (2) Changing a DNS record and expecting everyone to see it immediately; old answers live until the TTL expires. Clear the Windows client cache with <code>ipconfig /flushdns</code> and view it with <code>ipconfig /displaydns</code>. (3) Giving clients a public resolver instead of the internal DNS server, so internal names never resolve.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Non-authoritative answer" is not an error. It only means the answer came from a cache. Also remember the order a Windows or Linux host normally uses: hosts file (and local cache) first, then the configured DNS server.</p></div>

<div class="scn"><h4>One developer sees the old website</h4><p>After the web team moved the intranet to a new server, everybody saw the new site except one developer, who kept reaching the old server. <code>nslookup</code> on his PC returned the new address, yet the browser went to the old one. The engineer opened his hosts file and found a line he had added months earlier for testing, pointing the name at the old address. nslookup asks the DNS server directly and ignores the hosts file, while the browser uses the operating system resolver, which reads the hosts file first. Deleting the line fixed it.</p><p><b>Lesson:</b> when a single machine resolves differently, check the hosts file and local cache before touching the DNS servers.</p></div>

<div class="iv"><p class="q">"What is the difference between a recursive and an iterative DNS query?"</p><p>Strong answer: the client sends a recursive query to its resolver, asking for the final answer. The resolver then performs iterative queries: it asks a root server, receives a referral to the TLD servers, asks them, receives a referral to the authoritative servers, and finally gets the answer, which it caches for the record's TTL. Add that answers from cache are "non-authoritative" and that the hosts file is checked before DNS.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The hosts file is checked before DNS by default and overrides it on that one machine.</li>
<li>Clients ask a recursive resolver; the resolver queries root, TLD and authoritative servers iteratively.</li>
<li>Answers are cached for the TTL; lower the TTL before planned changes.</li>
<li>Authoritative answers come from the zone's own server; non-authoritative ones come from a cache.</li>
<li>DNS uses UDP 53 for normal queries.</li>
</ul></div>
`,hi:`
<p>Maan lo aapko doosre shehar ki ek chhoti dukaan ka phone number chahiye. Pehle aap apni diary dekhte ho (shayad pehle likha ho). Nahi mila, to aap apni well-connected dost se poochte ho. Use bhi nahi pata, to woh desh ki directory enquiries ko call karti hai, jo batati hai ki kis shehar ki directory ko phone karna hai, aur woh directory use dukaan ka number deti hai. Woh aapko batati hai, aur dono agli baar ke liye likh lete ho. Yahi <b>Domain Name System (DNS)</b> hai: ek local file, ek helpful resolver, directories ki ek chain, aur har jagah caching.</p>

<h3>Step 0: hosts file</h3>
<p>DNS se pehle har computer mein ek text file hoti thi jismein names aur addresses likhe hote the. Woh file aaj bhi hai, aur default mein zyada tar operating systems DNS se <b>pehle</b> use check karte hain:</p>
<ul>
<li>Windows: <code>C:\\Windows\\System32\\drivers\\etc\\hosts</code></li>
<li>Linux aur macOS: <code>/etc/hosts</code> (Linux order <code>/etc/nsswitch.conf</code> mein tay karta hai, normally "files dns")</li>
</ul>
<pre class="code"><span class="c"># hosts file example: address, phir naam</span>
127.0.0.1      localhost
10.0.20.10     web.nwk.lab</pre>
<p>Hosts file naye server ko uska DNS record banne se pehle test karne ke liye kaam ki hai. Yeh khatarnaak bhi hai: ek purani entry us ek machine par chupchaap DNS ko override kar deti hai, aur malware kabhi kabhi banking sites redirect karne ke liye hosts file edit karta hai. Jab sirf <b>ek</b> PC naam galat resolve kare, to ise hamesha check karo.</p>

<h3>DNS lookup ke players</h3>
<dl class="terms">
<dt>Stub resolver</dt><dd>Har operating system ke andar chhota DNS client. Yeh ek configured DNS server se poochta hai aur final answer ka wait karta hai.</dd>
<dt>Recursive resolver</dt><dd>Woh DNS server jo client use karne ke liye configured hai (DHCP option 6 se). Yeh mehnat ka kaam karta hai: client ki taraf se answer dhoondhta hai aur use cache karta hai. Examples: company ke internal DNS servers, ISP ke resolvers.</dd>
<dt>Root servers</dt><dd>Tree ka top ("."). Inhe final answers nahi pata; inhe pata hai ki har top-level domain kaun chalata hai.</dd>
<dt>TLD servers</dt><dd><code>.com</code>, <code>.in</code> ya <code>.example</code> jaise top-level domains ke servers. Inhe pata hai ki unke neeche har domain ke liye kaunse name servers authoritative hain.</dd>
<dt>Authoritative server</dt><dd>Woh server jiske paas domain ke actual records (zone) hain aur jo definitive answer deta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Recursive aur iterative DNS">
<rect x="10" y="100" width="100" height="50" rx="8" fill="#bae6fd"/><text x="60" y="130" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="190" y="100" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="255" y="122" text-anchor="middle" class="svg-ink" font-size="13">Recursive</text><text x="255" y="140" text-anchor="middle" class="svg-ink" font-size="13">resolver</text>
<rect x="450" y="10" width="170" height="44" rx="8" fill="#fde68a"/><text x="535" y="37" text-anchor="middle" class="svg-ink" font-size="13">Root server "."</text>
<rect x="450" y="103" width="170" height="44" rx="8" fill="#fed7aa"/><text x="535" y="130" text-anchor="middle" class="svg-ink" font-size="13">TLD server .example</text>
<rect x="450" y="196" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="223" text-anchor="middle" class="svg-ink" font-size="13">Authoritative shop.example</text>
<line x1="110" y1="125" x2="190" y2="125" stroke="#64748b" stroke-width="2"/><text x="150" y="115" text-anchor="middle" class="svg-accent" font-size="12">recursive</text>
<line x1="320" y1="115" x2="450" y2="32" stroke="#64748b"/><line x1="320" y1="125" x2="450" y2="125" stroke="#64748b"/><line x1="320" y1="135" x2="450" y2="218" stroke="#64748b"/>
<text x="385" y="60" text-anchor="middle" class="svg-muted" font-size="12">1</text><text x="385" y="118" text-anchor="middle" class="svg-muted" font-size="12">2</text><text x="385" y="190" text-anchor="middle" class="svg-muted" font-size="12">3</text>
<text x="255" y="185" text-anchor="middle" class="svg-accent" font-size="12">iterative queries 1-2-3</text>
</svg><p class="cap">Client ek recursive sawaal poochta hai; resolver root, TLD aur authoritative server se iteratively poochta hai, phir answer cache karta hai.</p></div>

<h3>Recursive vs iterative queries</h3>
<p><b>Recursive</b> query kehti hai "mujhe final answer do, ya error". Clients apne resolver ko recursive queries bhejte hain. <b>Iterative</b> query kehti hai "jo best pata hai woh batao"; answer ek <b>referral</b> ho sakta hai ("mujhe nahi pata, in servers se poocho"). Resolver pehle root ko, phir TLD ko, phir authoritative server ko iterative queries bhejta hai.</p>

<h3>Caching aur TTL</h3>
<p>Har record ke saath seconds mein ek <b>TTL</b> (time to live) hota hai, jo domain owner set karta hai. Resolver, aur client ka apna cache, answer ko utni der rakhte hain. 3600 TTL ka matlab hai ki changes ko har jagah dikhne mein ek ghanta tak lag sakta hai. Planned server move se pehle engineers ek din pehle TTL kam kar dete hain (jaise 300) taaki change jaldi faile. Negative answers ("yeh naam exist nahi karta") bhi cache hote hain.</p>

<h3>Authoritative vs non-authoritative answers</h3>
<p><b>Authoritative</b> answer seedha us server se aata hai jiske paas zone hai; DNS use <b>AA</b> (authoritative answer) flag se mark karta hai. <b>Non-authoritative</b> answer cache se aata hai. Dono normally sahi hote hain; "non-authoritative" ka simple matlab hai "maine yeh kisi aur se sun kar yaad rakha".</p>
<pre class="out">C:\\&gt; nslookup www.shop.example
Server:  dns1.nwk.lab
Address:  192.168.10.1

<span class="hl">Non-authoritative answer:</span>
Name:    www.shop.example
Address:  198.51.100.25</pre>

<div class="eg"><p><b>Worked example.</b> Ek laptop aaj pehli baar <code>www.shop.example</code> dhoondhta hai. (1) Hosts file: koi entry nahi. (2) Local cache: khaali. (3) Stub resolver 192.168.10.1 se recursively poochta hai. (4) Resolver root server se poochta hai aur use <code>.example</code> TLD servers ka referral milta hai. (5) TLD server use <code>ns1.shop.example</code> ki taraf refer karta hai. (6) Authoritative server TTL 3600 ke saath <code>198.51.100.25</code> answer deta hai. (7) Resolver use cache karta hai aur laptop ko jawab deta hai. Ek minute baad poochne wale doosre laptop ko seedha resolver ke cache se, non-authoritatively, lagbhag ek millisecond mein jawab milta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Jab ek PC alag behave kare to hosts file bhool jaana. (2) DNS record badal kar expect karna ki sabko turant dikhega; purane answers TTL expire hone tak rehte hain. Windows client cache <code>ipconfig /flushdns</code> se clear karo aur <code>ipconfig /displaydns</code> se dekho. (3) Clients ko internal DNS server ki jagah public resolver dena, jisse internal names kabhi resolve nahi hote.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Non-authoritative answer" error nahi hai. Iska sirf matlab hai ki answer cache se aaya. Yeh order bhi yaad rakho jo Windows ya Linux host normally use karta hai: pehle hosts file (aur local cache), phir configured DNS server.</p></div>

<div class="scn"><h4>Ek developer ko purani website dikhti hai</h4><p>Web team ne intranet ko naye server par move kiya, uske baad sabko nayi site dikhi siwaay ek developer ke, jo purane server par hi pahunchta raha. Uske PC par <code>nslookup</code> naya address deta tha, phir bhi browser purane par jaata tha. Engineer ne uski hosts file kholi aur ek line mili jo usne mahino pehle testing ke liye add ki thi, naam ko purane address par point karti hui. nslookup seedha DNS server se poochta hai aur hosts file ignore karta hai, jabki browser operating system resolver use karta hai, jo pehle hosts file padhta hai. Line delete karne se theek ho gaya.</p><p><b>Seekh:</b> jab ek hi machine alag resolve kare, to DNS servers ko chhoone se pehle hosts file aur local cache check karo.</p></div>

<div class="iv"><p class="q">"Recursive aur iterative DNS query mein kya farak hai?"</p><p>Strong answer: client apne resolver ko recursive query bhejta hai, final answer maangte hue. Resolver phir iterative queries karta hai: root server se poochta hai, TLD servers ka referral paata hai, unse poochta hai, authoritative servers ka referral paata hai, aur aakhir mein answer paata hai, jise woh record ke TTL tak cache karta hai. Jodo ki cache se aaye answers "non-authoritative" hote hain aur hosts file DNS se pehle check hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hosts file default mein DNS se pehle check hoti hai aur us ek machine par use override karti hai.</li>
<li>Clients recursive resolver se poochte hain; resolver root, TLD aur authoritative servers se iteratively poochta hai.</li>
<li>Answers TTL tak cache hote hain; planned changes se pehle TTL kam karo.</li>
<li>Authoritative answers zone ke apne server se aate hain; non-authoritative cache se.</li>
<li>DNS normal queries ke liye UDP 53 use karta hai.</li>
</ul></div>
`}};export{e as default};