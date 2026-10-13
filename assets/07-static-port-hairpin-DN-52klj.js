var e={id:`advanced`,h:{en:`Static NAT, port translation and the U-turn case`,hi:`Static NAT, port translation aur U-turn case`},body:{en:`
<p>The first six chapters cover the daily cases. This chapter extends them with three variations that appear in designs and interviews: one-to-one <b>static NAT</b>, <b>port translation</b> in destination NAT, and the <b>U-turn</b> (hairpin) case where an internal user reaches an internal server through its public address.</p>
<h3>Static NAT: one private host, one public address</h3>
<p>Static NAT maps one private address to one public address for source translation. The mapping is predictable, so a partner can allow-list it. The rule type is <code>static-ip</code>. In the previous chapter the rule <code>PC-STATIC</code> did exactly this. Its output in the simulator reads:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running nat-policy
"PC-STATIC; index: 1" {
        source PC-ONE;
<span class="hl">        translate-to "src: 203.0.113.5 (static-ip)";</span></pre>
<p>Static NAT can be <b>bi-directional</b>: the same mapping then also translates inbound traffic to the public address, which gives you a published host without writing a second destination NAT rule. A security rule is still required, written with the usual pre-NAT address and post-NAT zone logic.</p>
<h3>Port translation: publish on one port, serve on another</h3>
<p>Destination NAT can also change the port. A customer connects to 203.0.113.4 on TCP 80 while the server listens on 8080. The NAT rule adds <code>translated-port 8080</code>. The simulator shows it as <code>dst: 10.0.2.10:8080</code>:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running nat-policy
"WEB-ALT-8080; index: 4" {
        destination WEB-ALT;
<span class="hl">        translate-to "dst: 10.0.2.10:8080";</span></pre>
<p>The security rule still names the original port. Because the application web-browsing with application-default expects port 80, the rule from the client's point of view stays simple: <i>untrust to dmz, destination 203.0.113.4, web-browsing, application-default</i>.</p>
<h3>The U-turn case (reference, not run in the simulator)</h3>
<p>A PC on the LAN opens the company's website by its <b>public</b> address 203.0.113.3, although the server is in the DMZ. The packet goes to the firewall, the destination NAT sends it to 10.0.2.10 in the DMZ, and a problem appears: if the server answers directly to a private source in another zone, the reply may bypass the firewall's session. The standard remedy is to translate the <b>source</b> too, so that the server replies to a firewall address and the reply returns through the session. The simulator labs do not run this case, so what follows is a <b>reference configuration (not run in the simulator)</b>:</p>
<pre class="code"># Reference configuration (not run in the simulator)
set rulebase nat rules LAN-to-WEB-UTURN from trust to untrust source any destination WEB-PUBLIC service service-h&#116;tp source-translation dynamic-ip-and-port interface-address interface ethernet1/3 destination-translation translated-address WEB-PRIVATE
set rulebase security rules LAN-to-WEB from trust to dmz source any destination WEB-PUBLIC application web-browsing service application-default action allow</pre>
<p>Notice that the NAT zones still follow the pre-NAT rule (the public address routes to untrust) while the security rule uses the post-NAT zone dmz and the public address. The source translation uses the firewall's address in the DMZ so replies come back through the firewall.</p>
<div class="warn"><p><b>Common mistake.</b> Solving the U-turn case by adding a DNS record that points internal users to the private address. That is a valid alternative (split DNS) but it is a different design. Do not mix the two without documenting it.</p></div>
<div class="exam"><p><b>Exam trap.</b> DIPP, dynamic IP and static IP are source translations; the destination translation is separate and can change address and port. A single NAT rule may hold both a source translation and a destination translation.</p></div>
<div class="scn"><h4>The intranet that only broke for staff</h4><p>Customers reached the company site, but staff inside the LAN got timeouts when they used the public name. The server received the LAN source and answered directly via a different path. The engineer added a U-turn rule with source translation to the DMZ interface address; replies returned through the firewall and staff could open the site.</p><p><b>Lesson:</b> asymmetric return paths break stateful inspection; translate the source or use split DNS.</p></div>
<div class="iv"><p class="q">"What is U-turn (hairpin) NAT and why is it needed?"</p><p>It lets an internal client reach an internal server through the server's public address. The destination NAT sends the packet to the private server, and a source translation makes the server reply to the firewall so the reply passes through the same session instead of taking an asymmetric path. The alternative is split DNS.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Static NAT gives a fixed one-to-one public address.</li><li>Destination NAT can translate the port (<code>translated-port</code>).</li><li>U-turn NAT adds a source translation so replies return through the firewall.</li><li>Security rules keep the pre-NAT address and the post-NAT zone in all variations.</li></ul></div>
`,hi:`
<p>Pehle chhe chapters roz ke cases cover karte hain. Yeh chapter unhe teen variations ke saath badhata hai jo designs aur interviews mein aate hain: ek-se-ek <b>static NAT</b>, destination NAT mein <b>port translation</b>, aur <b>U-turn</b> (hairpin) case jahan internal user internal server tak uske public address se pahunchta hai.</p>
<h3>Static NAT: ek private host, ek public address</h3>
<p>Static NAT source translation ke liye ek private address ko ek public address se map karta hai. Mapping predictable hoti hai, isliye partner use allow-list kar sakta hai. Rule type <code>static-ip</code> hai. Pichhle chapter mein rule <code>PC-STATIC</code> yahi karti thi. Simulator mein uska output aisa hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running nat-policy
"PC-STATIC; index: 1" {
        source PC-ONE;
<span class="hl">        translate-to "src: 203.0.113.5 (static-ip)";</span></pre>
<p>Static NAT <b>bi-directional</b> ho sakta hai: tab wahi mapping public address par inbound traffic ko bhi translate karti hai, aur doosri destination NAT rule likhe bina host publish ho jaata hai. Security rule phir bhi chahiye, usual pre-NAT address aur post-NAT zone logic ke saath.</p>
<h3>Port translation: ek port par publish, doosre par serve</h3>
<p>Destination NAT port bhi badal sakta hai. Customer 203.0.113.4 par TCP 80 par connect karta hai jabki server 8080 par sunta hai. NAT rule <code>translated-port 8080</code> jodti hai. Simulator ise <code>dst: 10.0.2.10:8080</code> ki tarah dikhata hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running nat-policy
"WEB-ALT-8080; index: 4" {
        destination WEB-ALT;
<span class="hl">        translate-to "dst: 10.0.2.10:8080";</span></pre>
<p>Security rule abhi bhi original port ka naam leti hai. Kyunki application-default ke saath web-browsing port 80 expect karta hai, client ki nazar se rule saral rehti hai: <i>untrust to dmz, destination 203.0.113.4, web-browsing, application-default</i>.</p>
<h3>U-turn case (reference, simulator mein run nahi)</h3>
<p>LAN ka ek PC company ki website ko uske <b>public</b> address 203.0.113.3 se kholta hai, jabki server DMZ mein hai. Packet firewall tak jaata hai, destination NAT use DMZ ke 10.0.2.10 par bhejta hai, aur samasya aati hai: server dusre zone ke private source ko seedha jawab de to reply firewall ke session ko bypass kar sakta hai. Standard ilaaj <b>source</b> bhi translate karna hai, taaki server firewall address ko reply kare aur reply session ke through wapas aaye. Simulator labs yeh case nahi chalate, isliye neeche <b>reference configuration (simulator mein run nahi)</b> hai:</p>
<pre class="code"># Reference configuration (not run in the simulator)
set rulebase nat rules LAN-to-WEB-UTURN from trust to untrust source any destination WEB-PUBLIC service service-h&#116;tp source-translation dynamic-ip-and-port interface-address interface ethernet1/3 destination-translation translated-address WEB-PRIVATE
set rulebase security rules LAN-to-WEB from trust to dmz source any destination WEB-PUBLIC application web-browsing service application-default action allow</pre>
<p>Dhyan do ki NAT zones abhi bhi pre-NAT rule follow karte hain (public address untrust ki taraf route hota hai) jabki security rule post-NAT zone dmz aur public address use karti hai. Source translation DMZ mein firewall ka address use karta hai taaki replies firewall ke through aayein.</p>
<div class="warn"><p><b>Common mistake.</b> U-turn case ko internal users ko private address par point karne wala DNS record jodkar solve karna. Yeh valid alternative hai (split DNS) lekin alag design hai. Dono ko document kiye bina mat milao.</p></div>
<div class="exam"><p><b>Exam trap.</b> DIPP, dynamic IP aur static IP source translations hain; destination translation alag hai aur address tatha port badal sakta hai. Ek NAT rule mein source translation aur destination translation dono ho sakte hain.</p></div>
<div class="scn"><h4>Intranet jo sirf staff ke liye toota</h4><p>Customers company site tak pahunch rahe the, lekin LAN ke andar staff ko public naam use karne par timeout mil raha tha. Server ko LAN source mila aur usne alag raste se seedha jawab diya. Engineer ne DMZ interface address par source translation wali U-turn rule jodi; replies firewall ke through wapas aaye aur staff site khol paaya.</p><p><b>Lesson:</b> Asymmetric return paths stateful inspection todte hain; source translate karo ya split DNS use karo.</p></div>
<div class="iv"><p class="q">"U-turn (hairpin) NAT kya hai aur kyun chahiye?"</p><p>Yeh internal client ko internal server tak server ke public address se pahunchne deta hai. Destination NAT packet ko private server par bhejta hai, aur source translation server ko firewall ko reply karne par majboor karta hai taaki reply asymmetric path ke bajay usi session se guzre. Alternative split DNS hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Static NAT fixed ek-se-ek public address deta hai.</li><li>Destination NAT port bhi translate kar sakta hai (<code>translated-port</code>).</li><li>U-turn NAT source translation jodta hai taaki replies firewall ke through wapas aayein.</li><li>Saari variations mein security rules pre-NAT address aur post-NAT zone rakhti hain.</li></ul></div>
`}};export{e as default};