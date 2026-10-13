var e={id:`method-lists`,h:{en:`Configuring TACACS+ on IOS XE: servers, groups, method lists and fallback`,hi:`IOS XE par TACACS+ configure karna: servers, groups, method lists aur fallback`},body:{en:`
<p>A method list is like the instructions a hotel receptionist follows when a guest asks for the room key: "First check the central booking system. If the booking system is down, check the paper register in the drawer. If the booking system says the guest has no booking, do not open the drawer, just say no." That last sentence is the most important rule in this chapter.</p>

<h3>Step 1: prepare before you enable AAA</h3>
<p>The command <code>aaa new-model</code> changes how every line authenticates. The moment you type it, VTY lines stop using <code>login</code> passwords and start using the default method list, which is local users if nothing else is configured. So first create a local break-glass user, keep a second session open, and only then turn AAA on:</p>
<pre class="code"><span class="c">! 1. emergency account first (secret = stored as a one-way hash)</span>
username backup privilege 15 secret Backup#26
<span class="c">! 2. turn on AAA</span>
aaa new-model
<span class="c">! 3. define the TACACS+ server (lab values)</span>
tacacs server ISE
 address ipv4 10.10.10.100
 key NK-t4c-26
 timeout 5
<span class="c">! 4. optional named group, useful with several servers or a VRF</span>
aaa group server tacacs+ ISE-GRP
 server name ISE
<span class="c">! 5. source every TACACS+ packet from the address ISE knows</span>
ip tacacs source-interface GigabitEthernet0/0</pre>
<p>The keyword <code>group tacacs+</code> means "all TACACS+ servers defined on this box, in order". A named group such as <code>group ISE-GRP</code> lets you pick specific servers, set a VRF with <code>ip vrf forwarding Mgmt-vrf</code>, and keep different server sets for different lines.</p>

<h3>Step 2: method lists</h3>
<p>A <b>method list</b> is an ordered list of places to try. It has a type (login, exec, commands, and so on), a name (<code>default</code> or your own), and methods:</p>
<pre class="code">aaa authentication login default group tacacs+ local
aaa authentication login CONSOLE local
aaa authorization exec default group tacacs+ local
aaa accounting exec default start-stop group tacacs+
<span class="c">! the default list applies automatically; named lists must be applied</span>
line con 0
 login authentication CONSOLE
line vty 0 4
 login authentication default
 transport input ssh</pre>
<p>The <code>default</code> list is used by every line that does not name another list. A named list such as <code>CONSOLE</code> does nothing until a line references it. Some organisations keep the console on local only so a person physically at the device can always get in; others use TACACS+ on the console too. Both are acceptable as long as it is a conscious choice.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ERROR versus FAIL">
<rect x="230" y="15" width="180" height="46" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Try group tacacs+</text><text x="320" y="53" text-anchor="middle" class="svg-muted" font-size="12">ISE 10.10.10.100</text>
<line x1="280" y1="61" x2="120" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="61" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><line x1="360" y1="61" x2="520" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="120" width="160" height="46" rx="8" fill="#bbf7d0"/><text x="120" y="141" text-anchor="middle" class="svg-ink" font-size="13">PASS</text><text x="120" y="158" text-anchor="middle" class="svg-muted" font-size="12">logged in</text>
<rect x="240" y="120" width="160" height="46" rx="8" fill="#fed7aa"/><text x="320" y="141" text-anchor="middle" class="svg-ink" font-size="13">FAIL</text><text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">rejected, stop here</text>
<rect x="440" y="120" width="160" height="46" rx="8" fill="#fde68a"/><text x="520" y="141" text-anchor="middle" class="svg-ink" font-size="13">ERROR</text><text x="520" y="158" text-anchor="middle" class="svg-muted" font-size="12">no answer</text>
<line x1="520" y1="166" x2="520" y2="195" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="195" width="160" height="46" rx="8" fill="#ddd6fe"/><text x="520" y="216" text-anchor="middle" class="svg-ink" font-size="13">Try local</text><text x="520" y="233" text-anchor="middle" class="svg-muted" font-size="12">user backup</text>
</svg><p class="cap">The next method is tried only on ERROR (no answer), never on FAIL (an answer that says no).</p></div>

<h3>The fallback rule: ERROR versus FAIL</h3>
<p>The router moves to the next method only when the current one returns <b>ERROR</b>: the server is unreachable, times out, or resets the connection. If the server answers <b>FAIL</b> (wrong password, unknown user, account disabled), the attempt is rejected and the local database is <b>never</b> consulted. This is deliberate. Otherwise a fired engineer disabled in ISE could still log in with an old local password.</p>

<h3>Step 3: verify before you log out</h3>
<pre class="out">R1# test aaa group tacacs+ netadmin Adm!n-26 legacy
Attempting authentication test to server-group tacacs+ using tacacs+
<span class="hl">User was successfully authenticated.</span>

R1# show tacacs
Tacacs+ Server -  public  :
               Server name: ISE
            Server address: 10.10.10.100
               Server port: 49
              Socket opens:          3
             Socket closes:          3
              Socket aborts:          0
              Socket errors:          0
           Socket Timeouts:          0
   Failed Connect Attempts:          0
        Total Packets Sent:          6
        Total Packets Recv:          6</pre>
<p><code>test aaa</code> proves the key, reachability and the user in one step. <code>show tacacs</code> counts sockets and packets; rising "Socket errors" or "Failed Connect Attempts" point to a key or reachability problem. <code>show aaa servers</code> shows whether the server is UP or DEAD and how many accepts and rejects it returned.</p>

<div class="eg"><p><b>Worked example (Lab 1, tasks 1 and 2).</b> R1 starts with <code>login local</code> on the VTY lines and a local user <code>backup</code>. You enter <code>aaa new-model</code>, define <code>tacacs server ISE</code> with address 10.10.10.100 and key NK-t4c-26, and run the test: "successfully authenticated". Then you add the three lines for login authentication, exec authorization and exec accounting, and put <code>login authentication default</code> on <code>line vty 0 4</code>. Now an SSH login as netadmin goes to ISE; if you shut the ISE link, the test returns "No authoritative response from any server" (ERROR) and <code>backup</code> works locally.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing <code>aaa authentication login default local group tacacs+</code>. The order is reversed: local is tried first, and if the user is not in the local database that is a FAIL, so TACACS+ is never asked. Personal ISE accounts stop working and only local users can log in.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <code>local</code> method is used only when every server in the group returns ERROR. A wrong password on a live server does not fall back. Also, <code>aaa new-model</code> alone (no method list) makes VTY lines use local authentication; with no local users, remote login is impossible.</p></div>

<div class="scn"><h4>Locked out during the change window</h4><p>An engineer typed <code>aaa new-model</code> on 30 switches from a script, planning to add method lists in the next step. The script failed halfway. The switches had no local users, so every SSH session was refused and the team had to drive to four sites with console cables. The corrected procedure creates <code>username backup</code> first, pushes the full AAA block in one transaction, tests with <code>test aaa</code>, and only then closes the original session.</p><p><b>Lesson:</b> local user first, AAA second, test third, log out last.</p></div>

<div class="iv"><p class="q">"Your TACACS+ server rejects a user. Will the router fall back to the local account?"</p><p>No. Explain ERROR versus FAIL: fallback to the next method happens only when the server gives no answer. A reject is an authoritative answer, so the login fails. Mention that this protects against disabled accounts still working locally, and that the local account is a break-glass path for server outages only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Create a local break-glass user and keep a session open before <code>aaa new-model</code>.</li>
<li>Define servers with <code>tacacs server NAME</code>; <code>group tacacs+</code> means all of them, named groups pick some.</li>
<li>The <code>default</code> list applies automatically; named lists must be applied to a line.</li>
<li>Fallback happens only on ERROR (no response), never on FAIL (reject).</li>
<li>Verify with <code>test aaa</code>, <code>show tacacs</code> and <code>show aaa servers</code> before logging out.</li>
</ul></div>
`,hi:`
<p>Method list us receptionist ke instructions jaisi hai jo hotel mein guest ke room key maangne par follow karta hai: "Pehle central booking system check karo. Agar booking system down hai, to drawer mein paper register check karo. Agar booking system kehta hai ki guest ki koi booking nahi hai, to drawer mat kholo, bas mana kar do." Woh aakhri sentence is chapter ka sabse zaroori rule hai.</p>

<h3>Step 1: AAA enable karne se pehle taiyari</h3>
<p>Command <code>aaa new-model</code> badal deta hai ki har line kaise authenticate karti hai. Jaise hi aap ise type karte ho, VTY lines <code>login</code> passwords use karna band kar deti hain aur default method list use karne lagti hain, jo kuch aur configure na ho to local users hai. Isliye pehle ek local break-glass user banao, ek doosra session khula rakho, aur tab hi AAA on karo:</p>
<pre class="code"><span class="c">! 1. pehle emergency account (secret = one-way hash ke roop mein store)</span>
username backup privilege 15 secret Backup#26
<span class="c">! 2. AAA on karo</span>
aaa new-model
<span class="c">! 3. TACACS+ server define karo (lab values)</span>
tacacs server ISE
 address ipv4 10.10.10.100
 key NK-t4c-26
 timeout 5
<span class="c">! 4. optional named group, kai servers ya VRF ke saath useful</span>
aaa group server tacacs+ ISE-GRP
 server name ISE
<span class="c">! 5. har TACACS+ packet us address se bhejo jise ISE jaanta hai</span>
ip tacacs source-interface GigabitEthernet0/0</pre>
<p>Keyword <code>group tacacs+</code> ka matlab hai "is box par define saare TACACS+ servers, order mein". <code>group ISE-GRP</code> jaisa named group aapko specific servers chunne, <code>ip vrf forwarding Mgmt-vrf</code> se VRF set karne, aur alag lines ke liye alag server sets rakhne deta hai.</p>

<h3>Step 2: method lists</h3>
<p><b>Method list</b> try karne ki jagahon ki ordered list hai. Iska ek type hota hai (login, exec, commands, waghaira), ek naam (<code>default</code> ya aapka apna), aur methods:</p>
<pre class="code">aaa authentication login default group tacacs+ local
aaa authentication login CONSOLE local
aaa authorization exec default group tacacs+ local
aaa accounting exec default start-stop group tacacs+
<span class="c">! default list apne aap lagti hai; named lists apply karni padti hain</span>
line con 0
 login authentication CONSOLE
line vty 0 4
 login authentication default
 transport input ssh</pre>
<p><code>default</code> list har us line par use hoti hai jo koi doosri list name nahi karti. <code>CONSOLE</code> jaisi named list tab tak kuch nahi karti jab tak koi line use reference na kare. Kuch organisations console ko sirf local par rakhti hain taaki device ke paas physically khada insaan hamesha andar aa sake; doosri console par bhi TACACS+ use karti hain. Dono theek hain jab tak yeh soch-samajh kar liya gaya choice ho.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ERROR vs FAIL">
<rect x="230" y="15" width="180" height="46" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">group tacacs+ try karo</text><text x="320" y="53" text-anchor="middle" class="svg-muted" font-size="12">ISE 10.10.10.100</text>
<line x1="280" y1="61" x2="120" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="61" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><line x1="360" y1="61" x2="520" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="120" width="160" height="46" rx="8" fill="#bbf7d0"/><text x="120" y="141" text-anchor="middle" class="svg-ink" font-size="13">PASS</text><text x="120" y="158" text-anchor="middle" class="svg-muted" font-size="12">login ho gaya</text>
<rect x="240" y="120" width="160" height="46" rx="8" fill="#fed7aa"/><text x="320" y="141" text-anchor="middle" class="svg-ink" font-size="13">FAIL</text><text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">reject, yahin ruko</text>
<rect x="440" y="120" width="160" height="46" rx="8" fill="#fde68a"/><text x="520" y="141" text-anchor="middle" class="svg-ink" font-size="13">ERROR</text><text x="520" y="158" text-anchor="middle" class="svg-muted" font-size="12">koi jawab nahi</text>
<line x1="520" y1="166" x2="520" y2="195" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="195" width="160" height="46" rx="8" fill="#ddd6fe"/><text x="520" y="216" text-anchor="middle" class="svg-ink" font-size="13">local try karo</text><text x="520" y="233" text-anchor="middle" class="svg-muted" font-size="12">user backup</text>
</svg><p class="cap">Agla method sirf ERROR (koi jawab nahi) par try hota hai, FAIL (jawab jo mana karta hai) par kabhi nahi.</p></div>

<h3>Fallback rule: ERROR vs FAIL</h3>
<p>Router agle method par tabhi jaata hai jab current method <b>ERROR</b> lautata hai: server unreachable hai, time out hota hai, ya connection reset karta hai. Agar server <b>FAIL</b> jawab deta hai (galat password, unknown user, account disabled), to attempt reject hota hai aur local database <b>kabhi</b> check nahi hota. Yeh jaan-boojh kar hai. Warna ISE mein disable kiya gaya nikala hua engineer purane local password se abhi bhi login kar sakta.</p>

<h3>Step 3: logout se pehle verify karo</h3>
<pre class="out">R1# test aaa group tacacs+ netadmin Adm!n-26 legacy
Attempting authentication test to server-group tacacs+ using tacacs+
<span class="hl">User was successfully authenticated.</span>

R1# show tacacs
Tacacs+ Server -  public  :
               Server name: ISE
            Server address: 10.10.10.100
               Server port: 49
              Socket opens:          3
             Socket closes:          3
              Socket aborts:          0
              Socket errors:          0
           Socket Timeouts:          0
   Failed Connect Attempts:          0
        Total Packets Sent:          6
        Total Packets Recv:          6</pre>
<p><code>test aaa</code> ek step mein key, reachability aur user teeno prove karta hai. <code>show tacacs</code> sockets aur packets ginta hai; badhte "Socket errors" ya "Failed Connect Attempts" key ya reachability problem ki taraf ishara karte hain. <code>show aaa servers</code> dikhata hai ki server UP hai ya DEAD aur usne kitne accepts aur rejects lautaye.</p>

<div class="eg"><p><b>Worked example (Lab 1, tasks 1 aur 2).</b> R1 VTY lines par <code>login local</code> aur local user <code>backup</code> ke saath shuru hota hai. Aap <code>aaa new-model</code> daalte ho, <code>tacacs server ISE</code> ko address 10.10.10.100 aur key NK-t4c-26 ke saath define karte ho, aur test chalate ho: "successfully authenticated". Phir aap login authentication, exec authorization aur exec accounting ki teen lines jodte ho, aur <code>line vty 0 4</code> par <code>login authentication default</code> lagate ho. Ab netadmin ke roop mein SSH login ISE ke paas jaata hai; agar aap ISE link shut karo, to test "No authoritative response from any server" (ERROR) lautata hai aur <code>backup</code> locally chalta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>aaa authentication login default local group tacacs+</code> likhna. Order ulta hai: pehle local try hota hai, aur agar user local database mein nahi hai to woh FAIL hai, isliye TACACS+ se kabhi poocha hi nahi jaata. Personal ISE accounts kaam karna band kar dete hain aur sirf local users login kar paate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>local</code> method sirf tab use hota hai jab group ka har server ERROR lautaye. Live server par galat password fallback nahi karta. Aur sirf <code>aaa new-model</code> (bina method list) VTY lines ko local authentication use karwata hai; koi local user na ho to remote login namumkin hai.</p></div>

<div class="scn"><h4>Change window mein lockout</h4><p>Ek engineer ne script se 30 switches par <code>aaa new-model</code> type kiya, agle step mein method lists jodne ka plan tha. Script aadhe mein fail ho gayi. Switches par koi local users nahi the, isliye har SSH session refuse hua aur team ko console cables lekar chaar sites tak drive karna pada. Sahi procedure pehle <code>username backup</code> banata hai, poora AAA block ek transaction mein push karta hai, <code>test aaa</code> se test karta hai, aur tab hi original session band karta hai.</p><p><b>Seekh:</b> pehle local user, doosra AAA, teesra test, aakhir mein logout.</p></div>

<div class="iv"><p class="q">"Aapka TACACS+ server ek user ko reject karta hai. Kya router local account par fallback karega?"</p><p>Nahi. ERROR vs FAIL samjhao: agle method par fallback tabhi hota hai jab server koi jawab na de. Reject ek authoritative jawab hai, isliye login fail hota hai. Batao ki yeh disabled accounts ke locally kaam karte rehne se bachata hai, aur local account sirf server outages ke liye break-glass path hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>aaa new-model</code> se pehle local break-glass user banao aur ek session khula rakho.</li>
<li>Servers ko <code>tacacs server NAME</code> se define karo; <code>group tacacs+</code> ka matlab sab, named groups kuch chunte hain.</li>
<li><code>default</code> list apne aap lagti hai; named lists ko line par apply karna padta hai.</li>
<li>Fallback sirf ERROR (koi response nahi) par hota hai, FAIL (reject) par kabhi nahi.</li>
<li>Logout se pehle <code>test aaa</code>, <code>show tacacs</code> aur <code>show aaa servers</code> se verify karo.</li>
</ul></div>
`}};export{e as default};