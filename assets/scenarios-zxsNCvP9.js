var e=[{title:{en:`Created but never forwarded`,hi:`Created lekin kabhi forward nahi`},ticket:{en:`Security says Panorama shows nothing from Pune although users browse normally. You run the status command on the firewall after a web request from PC1.`,hi:`Security kehti hai Pune se Panorama par kuch nahi dikhta jabki users normally browse karte hain. PC1 se web request ke baad aap firewall par status command chalate ho.`},out:`PA1> show logging-status

Log forwarding agent: connected to Panorama 192.0.2.50
Panorama Server 1: 192.0.2.50  connected
Traffic logs:
    Total logs created                : 14
    Forwarded to Panorama             : 0
    Waiting to be forwarded           : 0`,q:{en:`Where is the fault?`,hi:`Fault kahan hai?`},o:[{en:`The management connection to Panorama`,hi:`Panorama ka management connection`},{en:`The logs are written but not selected for forwarding: check the rule and the profile`,hi:`Logs likhe gaye lekin forwarding ke liye select nahi hue: rule aur profile check karo`},{en:`The collector group is empty`,hi:`Collector group khaali hai`},{en:`The firewall buffer is full`,hi:`Firewall buffer full hai`}],a:1,w:{en:`The connection line shows connected and waiting is zero, so the path is healthy. Created grows but nothing is forwarded, so the logs never entered the forwarding path: the rule lacks a forwarding profile, the profile is wrong, or send to Panorama is no.`,hi:`Connection line connected dikhati hai aur waiting zero hai, isliye path healthy hai. Created badh raha hai lekin kuch forward nahi hua, matlab logs forwarding path mein gaye hi nahi: rule par forwarding profile nahi, profile galat, ya send to Panorama no hai.`}},{title:{en:`A growing backlog`,hi:`Badhta backlog`},ticket:{en:`After a collector change, logs from Chennai stopped appearing. The firewall is connected to Panorama and users are fine.`,hi:`Collector change ke baad Chennai ke logs aana band ho gaye. Firewall Panorama se connected hai aur users theek hain.`},out:`PA3> show logging-status

Log forwarding agent: connected to Panorama 192.0.2.50
Panorama Server 1: 192.0.2.50  connected
Traffic logs:
    Total logs created                : 40
    Forwarded to Panorama             : 6
    Waiting to be forwarded           : 34

PANO> show log-collector-group all

Group WEST (no log collector)
    Firewalls: 0079114500123`,q:{en:`What is the right fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Remove the log forwarding profile from the rule`,hi:`Rule se log forwarding profile hata do`},{en:`Change send to Panorama to no`,hi:`Send to Panorama ko no karo`},{en:`Reboot the firewall`,hi:`Firewall reboot karo`},{en:`Add a collector to group WEST and push the collector configuration`,hi:`Group WEST mein collector add karo aur collector configuration push karo`}],a:3,w:{en:`Waiting is climbing and the group has no collector, so the logs are selected but have nowhere to go. Once a collector is in the group and the collector configuration is pushed, the 34 waiting logs are delivered.`,hi:`Waiting badh raha hai aur group mein collector nahi, isliye logs select hain lekin jaane ki jagah nahi. Group mein collector aur collector configuration push ke baad 34 waiting logs deliver ho jate hain.`}},{title:{en:`The profile that does nothing`,hi:`Profile jo kuch nahi karta`},ticket:{en:`A new profile LFP was created, the rule names it, and it was pushed, yet Panorama stays empty. You read the profile.`,hi:`Naya profile LFP bana, rule uska naam leta hai, aur push hua, phir bhi Panorama khaali hai. Aap profile padhte ho.`},out:`PANO# show shared log-settings profiles LFP
LFP {
  match-list {
    ALL {
      log-type traffic;
      filter "All Logs";
      send-to-panorama no;
    }
  }
}`,q:{en:`What do you change?`,hi:`Kya badlte ho?`},o:[{en:`Set send-to-panorama to yes, commit and push`,hi:`send-to-panorama ko yes karo, commit aur push karo`},{en:`Change the filter to (action eq deny)`,hi:`Filter ko (action eq deny) karo`},{en:`Rename the profile`,hi:`Profile ka naam badlo`},{en:`Create a second device group`,hi:`Doosra device group banao`}],a:0,w:{en:`The match list is valid, but with send-to-panorama no it has no destination for Panorama. Setting it to yes, committing and pushing the device group fixes it. The filter All Logs is already the broadest.`,hi:`Match list valid hai, lekin send-to-panorama no ke saath Panorama ke liye destination nahi. Yes karke commit aur device group push se fix hota hai. All Logs filter pehle se sabse broad hai.`}},{title:{en:`The SIEM sees only half`,hi:`SIEM ko sirf aadha dikhta hai`},ticket:{en:`The SIEM team says denied sessions from Pune never arrive, but Panorama has them. The syslog server profile NK-SYSLOG exists in template NK-LOGS. You check the stack state.`,hi:`SIEM team kehti hai Pune ke denied sessions kabhi nahi aate, lekin Panorama par hain. Syslog server profile NK-SYSLOG template NK-LOGS mein hai. Aap stack state dekhte ho.`},out:`PANO> show devices all
Serial            Hostname          IP              Connected  Device group      Template stack    Shared policy Template
0079185321121     NK-PUNE-PA        192.0.2.11      yes        NK-BRANCHES       NK-STACK          In Sync       Out of Sync

PA1> show logging-status
    Total logs created                : 6
    Forwarded to Panorama             : 6
    Waiting to be forwarded           : 0`,q:{en:`What is the likely cause?`,hi:`Sambhavit cause kya hai?`},o:[{en:`The device group was not pushed`,hi:`Device group push nahi hua`},{en:`Panorama is passive`,hi:`Panorama passive hai`},{en:`The template with the syslog profile was committed but not pushed to the firewall`,hi:`Syslog profile wali template commit hui lekin firewall par push nahi hui`},{en:`The firewall serial is wrong`,hi:`Firewall ka serial galat hai`}],a:2,w:{en:`Shared policy is In Sync, so the profile with the DENY list arrived. The template is Out of Sync, so the syslog server profile it names is missing on the firewall. Push the template stack.`,hi:`Shared policy In Sync hai, isliye DENY list wala profile pahunch gaya. Template Out of Sync hai, isliye jis syslog server profile ka wo naam leta hai wo firewall par missing hai. Template stack push karo.`}},{title:{en:`Too much syslog`,hi:`Zyada syslog`},ticket:{en:`The SIEM licence is exhausted. The design said only denies go there. Pune produced one allowed web session and one denied SSH attempt during a test.`,hi:`SIEM licence khatam ho gayi. Design mein sirf denies wahan jane the. Test ke dauraan Pune ne ek allowed web session aur ek denied SSH attempt banaya.`},out:`PA1> show logging-status

Log forwarding agent: connected to Panorama 192.0.2.50
Panorama Server 1: 192.0.2.50  connected
Traffic logs:
    Total logs created                : 2
    Forwarded to Panorama             : 2
    Waiting to be forwarded           : 0
    Forwarded to syslog profile NK-SYSLOG : 2`,q:{en:`What does the syslog counter tell you?`,hi:`Syslog counter kya batata hai?`},o:[{en:`The design is correct; the SIEM licence is just small`,hi:`Design sahi hai; SIEM licence bas chhoti hai`},{en:`The syslog match list filter is too broad: allowed traffic is being sent as well`,hi:`Syslog match list ka filter bahut broad hai: allowed traffic bhi ja raha hai`},{en:`Panorama is duplicating logs`,hi:`Panorama logs duplicate kar raha hai`},{en:`The firewall created extra logs`,hi:`Firewall ne extra logs banaye`}],a:1,w:{en:`Two sessions occurred and only one was a denial, yet two were forwarded to syslog. The syslog destination is attached to a list that matches allowed traffic, such as All Logs. Narrow it to the deny expression.`,hi:`Do sessions hue aur sirf ek denial tha, phir bhi do syslog ko forward hue. Syslog destination aisi list se juda hai jo allowed traffic bhi match karti hai, jaise All Logs. Use deny expression tak narrow karo.`}},{title:{en:`Users fine, logs silent`,hi:`Users theek, logs chup`},ticket:{en:`The profile is correct and pushed. Web works. Panorama shows nothing. You read the firewall counters after several requests, then the rule on Panorama.`,hi:`Profile sahi hai aur pushed. Web chal raha hai. Panorama par kuch nahi. Kai requests ke baad firewall counters, phir Panorama par rule padhte ho.`},out:`PA2> show logging-status
    Total logs created                : 0
    Forwarded to Panorama             : 0
    Waiting to be forwarded           : 0

PANO# show device-group NK-BRANCHES pre-rulebase security rules Allow-Out
Allow-Out {
  from trust;
  to untrust;
  application [ ping dns web-browsing ssl ];
  action allow;
  log-setting LFP;
  log-end no;
}`,q:{en:`What is the cause?`,hi:`Cause kya hai?`},o:[{en:`Set log-end to yes on the rule, commit and push`,hi:`Rule par log-end yes karo, commit aur push karo`},{en:`The profile name is misspelled`,hi:`Profile ka naam galat likha hai`},{en:`The collector group is empty`,hi:`Collector group khaali hai`},{en:`Panorama is not reachable`,hi:`Panorama reachable nahi`}],a:0,w:{en:`Created is zero, so no log is being written. The rule has log-end no, so traffic is allowed but the session-end log is never produced. Turning it back on, committing and pushing fixes it.`,hi:`Created zero hai, isliye koi log likha hi nahi ja raha. Rule par log-end no hai, isliye traffic allow hota hai lekin session-end log kabhi nahi banta. Wapas on karke commit aur push se fix hota hai.`}},{title:{en:`Evidence after an outage`,hi:`Outage ke baad evidence`},ticket:{en:`The management link of Delhi was down for six hours and was restored. Security asks whether any Delhi traffic from that window is lost.`,hi:`Delhi ka management link chhe ghante down tha aur restore ho gaya. Security poochti hai us window ka Delhi traffic kho gaya kya.`},out:`PA2> show logging-status

Log forwarding agent: connected to Panorama 192.0.2.50
Panorama Server 1: 192.0.2.50  connected
Traffic logs:
    Total logs created                : 120
    Forwarded to Panorama             : 120
    Waiting to be forwarded           : 0

PANO> show logging-status device 0079134988264
    Logs received here   : 120
    Logs created on fw   : 120
    Waiting on firewall  : 0`,q:{en:`What conclusion is supported?`,hi:`Kaunsa conclusion supported hai?`},o:[{en:`Logs from the outage are lost forever`,hi:`Outage ke logs hamesha ke liye kho gaye`},{en:`Nothing can be said without a reboot`,hi:`Reboot ke bina kuch nahi kaha ja sakta`},{en:`Panorama created the logs itself`,hi:`Panorama ne logs khud banaye`},{en:`The backlog was delivered: received equals created and nothing is waiting, so the window is covered`,hi:`Backlog deliver ho gaya: received created ke barabar hai aur kuch waiting nahi, isliye window covered hai`}],a:3,w:{en:`Received here equals created on the firewall and waiting is zero, so everything that was written was delivered once the path returned. Record the outage window in the report.`,hi:`Yahan received firewall par created ke barabar hai aur waiting zero hai, isliye jo likha gaya wo path wapas aane par deliver ho gaya. Report mein outage window record karo.`}},{title:{en:`The collector group that was never pushed`,hi:`Collector group jo kabhi push nahi hua`},ticket:{en:`An engineer created collector group EAST with the local collector and moved the Pune firewall into it, then committed on Panorama only. Pune logs behave oddly afterwards.`,hi:`Engineer ne local collector ke saath collector group EAST banaya aur Pune firewall use mein daala, phir sirf Panorama par commit kiya. Uske baad Pune logs ajeeb behave karte hain.`},out:`PANO> show log-collector-group all

Group EAST (log collector Panorama)
    Firewalls: 0079185321121
Group default (local log collector on this Panorama)
    Firewalls: 0079134988264

PANO> show logging-status device 0079185321121
    Collector group      : default
    Logs received here   : 8
    Logs created on fw   : 8`,q:{en:`What does the device view tell you?`,hi:`Device view kya batata hai?`},o:[{en:`EAST is active already`,hi:`EAST pehle se active hai`},{en:`The group is not applied yet; push collector configuration for EAST`,hi:`Group abhi apply nahi hua; EAST ke liye collector configuration push karo`},{en:`Pune should be removed from Panorama`,hi:`Pune ko Panorama se hata dena chahiye`},{en:`The default group must be deleted`,hi:`Default group delete karna padega`}],a:1,w:{en:`The device still reports the default group, so the custom group is not in effect. A custom group takes effect only after the collector configuration is pushed for that group.`,hi:`Device abhi bhi default group dikhata hai, isliye custom group effect mein nahi hai. Custom group us group ke collector configuration push ke baad hi effect mein aata hai.`}}];export{e as default};