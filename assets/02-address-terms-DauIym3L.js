var e={id:`address-terms`,h:{en:`The four NAT address terms: inside/outside, local/global`,hi:`NAT ke chaar address terms: inside/outside, local/global`},body:{en:`
<p>Think of a person who has a home nickname and an official name. At home the family calls her "Munni"; at the office she is "Ms Priya Sharma". Same person, two names, and which name you hear depends on <b>where you are standing</b>. NAT addresses work the same way. One host can be known by two addresses, and Cisco uses four terms to say exactly which one you mean. These four terms appear in every NAT exam question and in every line of <code>show ip nat translations</code>, so learn them until they are automatic.</p>

<h3>Two words, two questions</h3>
<p>Each term is built from two words, and each word answers one question:</p>
<ul>
<li><b>Inside or outside</b> answers <i>"whose address is it?"</i> An <b>inside</b> address belongs to a host in your network (behind the NAT inside interface). An <b>outside</b> address belongs to a host out on the internet or the other side.</li>
<li><b>Local or global</b> answers <i>"from which side are we looking?"</i> A <b>local</b> address is how the host appears on the <b>inside</b> network. A <b>global</b> address is how the host appears on the <b>outside</b> network.</li>
</ul>
<p>Combine them and you get four terms:</p>
<dl class="terms">
<dt>Inside local</dt><dd>The inside host's address as seen inside. Normally its real, private address, for example 192.168.1.10. This is what you configured on the PC.</dd>
<dt>Inside global</dt><dd>The inside host's address as seen outside. The public address NAT gives it, for example 203.0.113.18. The internet only ever sees this one.</dd>
<dt>Outside global</dt><dd>The outside host's address as seen outside. Its real address, for example the web server 198.51.100.80.</dd>
<dt>Outside local</dt><dd>The outside host's address as seen inside. With normal inside source NAT nobody translates outside hosts, so it is <b>the same as outside global</b>.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Four NAT address terms">
<rect x="10" y="100" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="122" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="140" text-anchor="middle" class="svg-muted" font-size="12">192.168.1.10</text>
<rect x="255" y="100" width="130" height="50" rx="8" fill="#bae6fd"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">BR (NAT)</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">in g0/0 | out g0/1</text>
<rect x="500" y="100" width="130" height="50" rx="8" fill="#fde68a"/><text x="565" y="122" text-anchor="middle" class="svg-ink" font-size="13">SRV</text><text x="565" y="140" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.80</text>
<line x1="140" y1="125" x2="255" y2="125" stroke="#64748b" stroke-width="2"/><line x1="385" y1="125" x2="500" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="13">INSIDE network</text>
<text x="470" y="30" text-anchor="middle" class="svg-ink" font-size="13">OUTSIDE network</text>
<text x="160" y="190" text-anchor="middle" class="svg-accent" font-size="12">Inside local 192.168.1.10</text>
<text x="160" y="210" text-anchor="middle" class="svg-accent" font-size="12">Outside local 198.51.100.80</text>
<text x="470" y="190" text-anchor="middle" class="svg-accent" font-size="12">Inside global 203.0.113.18</text>
<text x="470" y="210" text-anchor="middle" class="svg-accent" font-size="12">Outside global 198.51.100.80</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">Local = seen on the inside. Global = seen on the outside.</text>
</svg><p class="cap">The packet between PC1 and BR carries the two local addresses; between BR and SRV it carries the two global addresses.</p></div>

<h3>A trick that always works: look at the wire</h3>
<p>Stand on a link and look at a packet. On the <b>inside</b> link you see only <b>local</b> addresses: the source is the inside local, the destination is the outside local. On the <b>outside</b> link you see only <b>global</b> addresses: the source is the inside global, the destination is the outside global. NAT's whole job is to swap the local pair for the global pair as the packet crosses the router, and swap back on the reply.</p>

<div class="eg"><p><b>Worked example from the static NAT lab.</b> The course portal is 172.16.10.80 inside and is published as 203.0.113.5. An internet user, PC-EXT 198.51.100.50, opens the portal. On EDGE the four terms are: inside local 172.16.10.80, inside global 203.0.113.5, outside local 198.51.100.50, outside global 198.51.100.50. Notice the outside pair is identical because we only translate inside addresses. The web flow in the table looks like this:</p>
<pre class="out">EDGE# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
<span class="hl">tcp  203.0.113.5:80     172.16.10.80:80    198.51.100.50:49812 198.51.100.50:49812</span>
---  203.0.113.5        172.16.10.80       ---                ---</pre>
<p>Read the header left to right: <b>inside global, inside local, outside local, outside global</b>. The line with <code>---</code> in the Pro column and the outside columns is the permanent static entry itself; the <code>tcp</code> line is one real connection.</p></div>

<h3>Drills: name the term</h3>
<ol>
<li>A PAT router shows 203.0.113.18:1024 for PC 192.168.2.10. Which term is 203.0.113.18? <b>Inside global.</b></li>
<li>You look at a packet on the LAN side of the router going to a server. Its destination is 198.51.100.80. <b>Outside local</b> (equal to outside global here).</li>
<li>The address typed in the PC's network settings? <b>Inside local.</b></li>
<li>An ISP router sees a packet with source 100.64.50.10 coming from your dynamic NAT router. <b>Inside global</b>, taken from the pool.</li>
<li>Your company translates a partner's overlapping 10.1.1.5 to 10.99.1.5 so it looks unique inside. What is 10.99.1.5? <b>Outside local</b>; 10.1.1.5 is outside global.</li>
</ol>
<p>The last drill shows the rare case where outside local and outside global differ: <b>outside source NAT</b> (<code>ip nat outside source static</code>), used when two merged companies have overlapping ranges. It is useful to know it exists; the CCNA configuration focus is inside source NAT.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking "local means private and global means public". Usually true, but the definitions are about <b>viewpoint</b>, not address class. In the dynamic NAT lab the inside global addresses come from 100.64.50.0/24, which is shared address space and not a classic public range, yet they are still inside global.</p></div>

<div class="exam"><p><b>Exam trap.</b> The column order in <code>show ip nat translations</code> is inside global first, then inside local. Many candidates read the first column as the PC's address and pick the wrong answer. The PC's own address is in the <b>second</b> column, Inside local.</p></div>

<div class="scn"><h4>The ticket that quoted the wrong address</h4><p>A NOC engineer received an abuse report saying "host 203.0.113.18 port 51544 scanned us at 14:02". She searched the DHCP logs for 203.0.113.18 and found nothing, because that is the inside global address shared by the whole branch. She then checked the NAT log entries for inside global 203.0.113.18:51544 around 14:02, found inside local 192.168.2.37, and traced that to a laptop via DHCP.</p><p><b>Lesson:</b> outsiders only ever see inside global addresses; you need the NAT table or NAT logs to get back to the inside local.</p></div>

<div class="iv"><p class="q">"Explain inside local, inside global, outside local and outside global."</p><p>Strong answer: inside/outside says which host the address belongs to; local/global says on which side of the NAT router it is seen. Inside local is the inside host's real private address; inside global is the public address representing it outside; outside global is the remote host's real address; outside local is how that remote host appears inside, the same as outside global unless you do outside NAT. Give a quick example with real numbers and mention the column order of show ip nat translations.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inside/outside = whose address; local/global = which side it is seen from.</li>
<li>Inside local = PC's real address; inside global = the public address that represents it.</li>
<li>Outside local equals outside global unless you configure outside source NAT.</li>
<li>On the inside wire you see the local pair; on the outside wire you see the global pair.</li>
<li>show ip nat translations columns: Pro, Inside global, Inside local, Outside local, Outside global.</li>
</ul></div>
`,hi:`
<p>Ek aise insaan ko socho jiska ghar ka nickname aur ek official naam hai. Ghar par family use "Munni" bulati hai; office mein woh "Ms Priya Sharma" hai. Insaan ek, naam do, aur aap kaunsa naam sunte ho yeh is par depend karta hai ki aap <b>kahan khade ho</b>. NAT addresses bhi aise hi kaam karte hain. Ek host do addresses se jaana ja sakta hai, aur Cisco chaar terms use karta hai yeh exactly batane ke liye ki aapka matlab kaunsa hai. Yeh chaar terms har NAT exam question mein aur <code>show ip nat translations</code> ki har line mein aate hain, isliye inhe itna seekho ki automatic ho jaayein.</p>

<h3>Do shabd, do sawaal</h3>
<p>Har term do shabdon se bana hai, aur har shabd ek sawaal ka jawab deta hai:</p>
<ul>
<li><b>Inside ya outside</b> jawab deta hai <i>"yeh address kiska hai?"</i> <b>Inside</b> address aapke network ke host ka hai (NAT inside interface ke peeche). <b>Outside</b> address internet par ya doosri taraf ke host ka hai.</li>
<li><b>Local ya global</b> jawab deta hai <i>"hum kis side se dekh rahe hain?"</i> <b>Local</b> address yeh hai ki host <b>inside</b> network par kaisa dikhta hai. <b>Global</b> address yeh hai ki host <b>outside</b> network par kaisa dikhta hai.</li>
</ul>
<p>Inhe jodo to chaar terms bante hain:</p>
<dl class="terms">
<dt>Inside local</dt><dd>Inside host ka address jaisa andar dikhta hai. Normally uska asli, private address, jaise 192.168.1.10. Yahi aapne PC par configure kiya tha.</dd>
<dt>Inside global</dt><dd>Inside host ka address jaisa bahar dikhta hai. NAT jo public address deta hai, jaise 203.0.113.18. Internet sirf yahi dekhta hai.</dd>
<dt>Outside global</dt><dd>Outside host ka address jaisa bahar dikhta hai. Uska asli address, jaise web server 198.51.100.80.</dd>
<dt>Outside local</dt><dd>Outside host ka address jaisa andar dikhta hai. Normal inside source NAT mein koi outside hosts ko translate nahi karta, isliye yeh <b>outside global jaisa hi</b> hota hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="NAT ke chaar address terms">
<rect x="10" y="100" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="122" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="140" text-anchor="middle" class="svg-muted" font-size="12">192.168.1.10</text>
<rect x="255" y="100" width="130" height="50" rx="8" fill="#bae6fd"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">BR (NAT)</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">in g0/0 | out g0/1</text>
<rect x="500" y="100" width="130" height="50" rx="8" fill="#fde68a"/><text x="565" y="122" text-anchor="middle" class="svg-ink" font-size="13">SRV</text><text x="565" y="140" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.80</text>
<line x1="140" y1="125" x2="255" y2="125" stroke="#64748b" stroke-width="2"/><line x1="385" y1="125" x2="500" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="13">INSIDE network</text>
<text x="470" y="30" text-anchor="middle" class="svg-ink" font-size="13">OUTSIDE network</text>
<text x="160" y="190" text-anchor="middle" class="svg-accent" font-size="12">Inside local 192.168.1.10</text>
<text x="160" y="210" text-anchor="middle" class="svg-accent" font-size="12">Outside local 198.51.100.80</text>
<text x="470" y="190" text-anchor="middle" class="svg-accent" font-size="12">Inside global 203.0.113.18</text>
<text x="470" y="210" text-anchor="middle" class="svg-accent" font-size="12">Outside global 198.51.100.80</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">Local = andar se dikhta. Global = bahar se dikhta.</text>
</svg><p class="cap">PC1 aur BR ke beech packet mein dono local addresses hote hain; BR aur SRV ke beech dono global addresses.</p></div>

<h3>Ek trick jo hamesha kaam karti hai: wire ko dekho</h3>
<p>Kisi link par khade ho kar packet dekho. <b>Inside</b> link par aapko sirf <b>local</b> addresses dikhte hain: source inside local hai, destination outside local. <b>Outside</b> link par sirf <b>global</b> addresses dikhte hain: source inside global, destination outside global. NAT ka poora kaam yahi hai ki packet router cross kare to local pair ko global pair se badle, aur reply par wapas badle.</p>

<div class="eg"><p><b>Static NAT lab se worked example.</b> Course portal andar 172.16.10.80 hai aur 203.0.113.5 ke roop mein publish hai. Ek internet user, PC-EXT 198.51.100.50, portal kholta hai. EDGE par chaar terms hain: inside local 172.16.10.80, inside global 203.0.113.5, outside local 198.51.100.50, outside global 198.51.100.50. Dhyan do outside pair same hai kyunki hum sirf inside addresses translate karte hain. Table mein web flow aisa dikhta hai:</p>
<pre class="out">EDGE# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
<span class="hl">tcp  203.0.113.5:80     172.16.10.80:80    198.51.100.50:49812 198.51.100.50:49812</span>
---  203.0.113.5        172.16.10.80       ---                ---</pre>
<p>Header left se right padho: <b>inside global, inside local, outside local, outside global</b>. Jis line mein Pro column aur outside columns mein <code>---</code> hai woh khud permanent static entry hai; <code>tcp</code> line ek asli connection hai.</p></div>

<h3>Drills: term ka naam batao</h3>
<ol>
<li>PAT router PC 192.168.2.10 ke liye 203.0.113.18:1024 dikhata hai. 203.0.113.18 kaunsa term hai? <b>Inside global.</b></li>
<li>Aap router ki LAN side par server ki taraf jaata packet dekhte ho. Destination 198.51.100.80 hai. <b>Outside local</b> (yahan outside global ke barabar).</li>
<li>PC ki network settings mein type kiya address? <b>Inside local.</b></li>
<li>ISP router ko aapke dynamic NAT router se source 100.64.50.10 wala packet dikhta hai. <b>Inside global</b>, pool se liya hua.</li>
<li>Aapki company ek partner ke overlapping 10.1.1.5 ko 10.99.1.5 mein translate karti hai taaki andar unique dikhe. 10.99.1.5 kya hai? <b>Outside local</b>; 10.1.1.5 outside global hai.</li>
</ol>
<p>Aakhri drill woh rare case dikhati hai jahan outside local aur outside global alag hote hain: <b>outside source NAT</b> (<code>ip nat outside source static</code>), jo tab use hota hai jab do merged companies ki ranges overlap karti hain. Yeh jaanna kaam ka hai ki aisa hota hai; CCNA configuration ka focus inside source NAT hai.</p>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki "local matlab private aur global matlab public". Aam taur par sach hai, par definitions <b>viewpoint</b> ke baare mein hain, address class ke baare mein nahi. Dynamic NAT lab mein inside global addresses 100.64.50.0/24 se aate hain, jo shared address space hai aur classic public range nahi, phir bhi woh inside global hi hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show ip nat translations</code> mein column order pehle inside global, phir inside local hai. Bahut candidates pehle column ko PC ka address samajh kar galat answer chun lete hain. PC ka apna address <b>doosre</b> column, Inside local, mein hota hai.</p></div>

<div class="scn"><h4>Woh ticket jismein galat address quote hua</h4><p>Ek NOC engineer ko abuse report mili: "host 203.0.113.18 port 51544 ne 14:02 par humein scan kiya". Usne DHCP logs mein 203.0.113.18 dhoondha aur kuch nahi mila, kyunki yeh poori branch ka shared inside global address hai. Phir usne 14:02 ke aas paas inside global 203.0.113.18:51544 ki NAT log entries check kin, inside local 192.168.2.37 mila, aur DHCP se use ek laptop tak trace kiya.</p><p><b>Seekh:</b> bahar wale sirf inside global addresses dekhte hain; inside local tak wapas pahunchne ke liye NAT table ya NAT logs chahiye.</p></div>

<div class="iv"><p class="q">"Inside local, inside global, outside local aur outside global samjhao."</p><p>Strong answer: inside/outside batata hai address kis host ka hai; local/global batata hai NAT router ki kis side se dikhta hai. Inside local inside host ka asli private address hai; inside global woh public address hai jo bahar use represent karta hai; outside global remote host ka asli address hai; outside local yeh hai ki woh remote host andar kaisa dikhta hai, jab tak outside NAT na ho outside global jaisa hi. Asli numbers ke saath chhota example do aur show ip nat translations ka column order batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inside/outside = address kiska hai; local/global = kis side se dikhta hai.</li>
<li>Inside local = PC ka asli address; inside global = use represent karne wala public address.</li>
<li>Outside local outside global ke barabar hota hai jab tak aap outside source NAT configure na karo.</li>
<li>Inside wire par local pair dikhta hai; outside wire par global pair.</li>
<li>show ip nat translations columns: Pro, Inside global, Inside local, Outside local, Outside global.</li>
</ul></div>
`}};export{e as default};