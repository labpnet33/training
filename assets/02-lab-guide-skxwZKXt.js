var e={id:`ise-foundations-lab-guide`,h:{en:`Lab walkthroughs and acceptance checks`,hi:`Lab walkthroughs aur acceptance checks`},body:{en:`<p>These exercises use the same six-device topology. ACCESS is the network access device, ISE is the CONFIG policy server, and STAFF, PRINTER and UNKNOWN represent three endpoint cases. APP is the protected service. Open each lab from this module to practise its specific fault and assessment.</p><h3>Register the network access device</h3><p>ACCESS is reachable but its RADIUS source address is not registered on ISE. Register 10.99.99.1 with ConfigRadius26, then reauthenticate. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Register the correct NAS address and shared key.</li><li>Prove staff authorization and keep unknown endpoints denied.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ISE:
aaa-server client 10.99.99.1 key ConfigRadius26

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Ticket: shared-secret mismatch</h3><p>The NAS has the wrong RADIUS shared secret. Inspect the ISE helper log and correct only the NAS key. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Restore the intended NAS key.</li><li>Inspect the request evidence and restore staff traffic.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ISE:
aaa-server show log

ACCESS:
enable
configure terminal
radius server ISE
key ConfigRadius26
end

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds</pre></details><h3>Ticket: policy service is stopped</h3><p>IP connectivity to ISE works but its simulated RADIUS service is stopped. Restore the service without forcing the port open. CONFIG lab: aaa-server commands on ISE are simulator helpers, not native ISE commands. The packet demo uses EAP-MD5; EAP-TLS, certificates, policy-set GUI, profiling and real posture require a vendor lab.</p><ol><li>Start the policy service.</li><li>Reauthenticate successfully with controlled access still enabled.</li></ol><details><summary>Command reference for this exercise</summary><pre class="code">ISE:
aaa-server start

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Evidence to keep</h3><p>Record the starting failure, the component changed, the resulting identity/method/VLAN/SGT and the traffic outcome. A denied flow must be accompanied by a useful positive test so a disconnected endpoint cannot masquerade as successful isolation. Use only the supplied lab identities. The server helpers and packet model demonstrate concepts; they do not validate a real ISE GUI, certificate chain, posture agent or production deployment.</p>`,hi:`<p>Exercises same six-device topology use karti hain. ACCESS network access device, ISE CONFIG policy server aur STAFF, PRINTER, UNKNOWN teen endpoint cases hain. APP protected service hai. Specific fault aur assessment practice karne ke liye module se har lab kholo.</p><h3>Network access device register karo</h3><p>ACCESS reachable hai lekin uska RADIUS source ISE mein registered nahi. 10.99.99.1 ko ConfigRadius26 se register karke reauthenticate karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Correct NAS address aur shared key register karo.</li><li>Staff authorization prove karo aur unknown endpoints denied rakho.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ISE:
aaa-server client 10.99.99.1 key ConfigRadius26

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Ticket: shared-secret mismatch</h3><p>NAS ka RADIUS shared secret wrong hai. ISE helper log inspect karke sirf NAS key correct karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Intended NAS key restore karo.</li><li>Request evidence inspect karo aur staff traffic restore karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ISE:
aaa-server show log

ACCESS:
enable
configure terminal
radius server ISE
key ConfigRadius26
end

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds</pre></details><h3>Ticket: policy service stopped hai</h3><p>ISE ki IP connectivity working hai lekin simulated RADIUS service stopped hai. Port force-open kiye bina service restore karo. CONFIG lab: ISE par aaa-server commands simulator helpers hain, native ISE commands nahi. Packet demo EAP-MD5 use karta hai; EAP-TLS, certificates, policy-set GUI, profiling aur real posture ke liye vendor lab chahiye.</p><ol><li>Policy service start karo.</li><li>Controlled access enabled rakhkar successful reauthentication karo.</li></ol><details><summary>Is exercise ka command reference</summary><pre class="code">ISE:
aaa-server start

ACCESS:
enable
clear authentication sessions

Wait 12 simulated seconds

ACCESS:
show authentication sessions</pre></details><h3>Evidence record karo</h3><p>Starting failure, changed component, resulting identity/method/VLAN/SGT aur traffic outcome record karo. Denied flow ke saath useful positive test chahiye taaki disconnected endpoint ko successful isolation na maana jaye. Sirf supplied lab identities use karo. Server helpers aur packet model concepts demonstrate karte hain; real ISE GUI, certificate chain, posture agent ya production deployment validate nahi karte.</p>`}};export{e as default};