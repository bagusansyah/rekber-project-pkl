
//     <div className="min-h-screen bg-gray-50">
//       <div className="flex flex-col md:flex-row"> 
//         <div className="flex-1 p-2 md:flex-[2]">
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle className="text-xl font-semibold text-blue-600">{transaction?.title ?? '...'}</CardTitle>
//                   <p className="text-sm text-gray-600 mt-1">{transaction?.notes ?? '...'}</p>
//                 </div>
//                 {getStatusBadge(transaction?.status ?? '...')}
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className='flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200'>
//                 <div>
//                   <p className='text-sm font-medium text-slate-700'>Nomor Transaksi</p>
//                   <p className='text-lg font-mono font-bold text-slate-900'>
//                     {transaction?.kode_transaksi ?? '...'}
//                   </p>
//                 </div>
//                 <Button
//                   onClick={copyTransactionId}
//                   variant='outline'
//                   size='sm'
//                   className='border-slate-200 text-slate-600 hover:bg-slate-50'
//                 >
//                   <Copy className='w-4 h-4' />
//                 </Button>
//               </div>

//               <div className="grid grid-cols-2 gap-6">
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Judul transaksi</label>
//                   <p className="mt-1">{transaction?.title ?? '...'}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Pembeli</label>
//                   <p className="mt-1">{transaction?.buyer_name ?? '...'}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-6">
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Penjual</label>
//                   <p className="mt-1">{transaction?.seller_name ?? '...'}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Status</label>
//                   <div className="mt-1"> 
//                       {getStatusBadge(transaction?.status ?? '...')}
//                   </div>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-2 gap-6">
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">Kategori Barang</label>
//                   <p className="mt-1">{transaction?.categ_id ? getCategoryName(transaction.categ_id) : '...'}</p>
//                 </div>
//               </div>
//               <Separator />

//               <div>
//                 <h3 className="text-lg font-semibold flex items-center space-x-2 mb-4"> 
//                   <span>Rincian Keuangan</span>
//                 </h3>

//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span>Jumlah</span>
//                     <span className="font-semibold">Rp {Number(transaction?.total_amount).toLocaleString('id-ID') ?? '0'}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Fee Transaksi</span>
//                     <span className="font-semibold">Rp {Number(transaction?.fee_amount).toLocaleString('id-ID') ?? '0'}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Pembayaran yang Dibuat</span>
//                     <span className="font-semibold">Rp {Number(transaction?.amount_paid).toLocaleString('id-ID') ?? '0'}</span>
//                   </div>

//                   <Separator />

//                   <div className="flex justify-between text-lg font-bold text-blue-600">
//                     <span>Dana yang Akan Ditahan Pihak Rekber</span>
//                     <span>Rp {Number(transaction?.total_amount).toLocaleString('id-ID') ?? '0'}</span>
//                   </div>
//                 </div>
//               </div> 
//            <div className="grid grid-cols-2 gap-4 items-center">
//               <div className="flex flex-col gap-2">
//                 <PaymentGateway 
//                   baseAmount={Number(transaction?.amount_paid)} 
//                   transactionId={transaction?.kode_transaksi ?? ''} 
//                   onPaymentSelect={(method) => {
//                     // Optional: handle payment method selection
//                     console.log('Selected payment method:', method)
//                   }}
//                 />
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsShareModalOpen(true)}
//                   className="border-blue-600 text-blue-600 hover:bg-blue-50"
//                 >
//                   <Share2 className="h-4 w-4 mr-2" />
//                   Share Link
//                 </Button>
//               </div>
//               {transaction?.status === "draft" && 
//               localStorage.getItem('user_id') == transaction.seller_id && (
//                 <Button 
//                   onClick={handleCancelTransaction}
//                   className="bg-red-600 hover:bg-red-700 text-white"
//                 >
//                   Batalkan Transaksi
//                 </Button>
//               )}
              
//               {transaction?.status === "paid" && 
//                 localStorage.getItem('user_id') == transaction.buyer_id && (
//                   <Button 
//                     onClick={() => setIsConfirmCompleteOpen(true)}
//                     className="bg-green-600 hover:bg-green-700 text-white"
//                   >
//                     <CheckCircle className="h-4 w-4 mr-2" />
//                     Selesaikan Transaksi
//                   </Button>
//                 )}

//               {transaction?.status === "completed" && (
//                 <div className="flex items-center gap-2 text-green-600 font-medium">
//                   <CheckCircle className="h-4 w-4" />
//                   <span>Transaksi Selesai</span>
//                 </div>
//               )}
//             </div> 
//             </CardContent>
//           </Card>
//         </div>

//       <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
//         <DialogContent className="max-w-md mx-auto">
//           <DialogHeader className="flex flex-row items-center justify-between">
//             <DialogTitle className="text-lg font-semibold">
//                Bagikan Transaksi</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-3">
//             <div className="text-sm text-gray-600 mb-4">Bagikan link transaksi ini ke platform media sosial</div>

//             {socialPlatforms.map((platform) => (
//               <Button
//                 key={platform.name}
//                 onClick={() => handleShare(platform)}
//                 className={`w-full justify-start text-white ${platform.color}`}
//               >
//                 <span className="text-xl mr-3">{platform.icon}</span>
//                 Bagikan ke {platform.name}
//               </Button>
//             ))}
//           </div>
//         </DialogContent>
//       </Dialog>

//         {/* Sidebar - Progress dan Chat */}
//         <div className="w-full md:w-1/3 p-2 space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg flex items-center space-x-2">
//                 <Clock className="h-5 w-5" />
//                 <span>Progress Transaksi</span>
//               </CardTitle>
//               <p className="text-sm text-gray-600">Timeline dan status transaksi {transaction?.kode_transaksi ?? ''}</p>
//             </CardHeader>
//             <CardContent>
//               <ScrollArea className="max-h-[400px]">
//                 <div className="space-y-4">
//                   {timeline.length === 0 ? (
//                     <p className="text-gray-500 text-center">Belum ada log status</p>
//                   ) : (
//                     timeline.map((step, index) => (
//                       <div key={step.id} className="relative">
//                         {index < timeline.length - 1 && (
//                           <div className="absolute left-5 top-8 w-0.5 h-16 bg-gray-200"></div>
//                         )}
//                         <div className="flex items-start space-x-3">
//                           <div
//                             className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
//                               step.status === "completed"
//                                 ? "bg-green-50 border-green-200"
//                                 : step.status === "current"
//                                   ? "bg-blue-50 border-blue-200"
//                                   : "bg-gray-50 border-gray-200"
//                             }`}
//                           >
//                             {getProgressIcon(step.status)}
//                           </div>

//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center justify-between mb-1">
//                               <h4 className={`font-medium text-sm ${step.status === "current" ? "text-blue-600" : "text-gray-900"}`}>
//                                 {step.title}
//                               </h4>
//                               {getProgressBadge(step.status)}
//                             </div>

//                             <p className="text-xs text-gray-600 mb-2">{step.description}</p>
//                             {step.timestamp && (
//                               <p className="text-xs text-gray-500">
//                                 {new Date(step.timestamp).toLocaleString("id-ID", {
//                                   day: "2-digit",
//                                   month: "2-digit",
//                                   year: "numeric",
//                                   hour: "2-digit",
//                                   minute: "2-digit",
//                                 })}
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </ScrollArea>
//             </CardContent>
//           </Card>
 
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg flex items-center space-x-2">
//                 <MessageCircle className="h-5 w-5" />
//                 <span>Percakapan Kedua Belah Pihak</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4 bg-gray-50 ">
//                 <ScrollArea ref={scrollAreaRef} className="max-h-[200px] h-[200px] overflow-y-auto">
//                   <div className="space-y-4 py-4 h-full">
//                     {messages.length === 0 ? (
//                       <div className='flex flex-col items-center justify-center h-full text-center py-2'>
//                         <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4'>
//                           <MessageCircle className='w-8 h-8 text-slate-400' />
//                         </div>
//                         <h3 className='text-lg font-semibold text-slate-700 mb-2'>Belum ada percakapan</h3>
//                         <p className='text-slate-500 text-sm'>Mulai komunikasi dengan mengirim pesan.</p>
//                       </div>
//                     ) : (
//                       <>
//                         {messages.map((msg, idx) => {
//                           const isMe = msg.user_id == (localStorage.getItem('user_id') || 'You');
//                           return (
//                             <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
//                               <div className={`rounded-lg px-4 py-2 max-w-xs ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
//                                 <p className={`text-xs mb-1 font-medium ${isMe ? 'text-blue-100' : 'text-gray-600'}`}>
//                                   {'~ ' + msg.user_name || (isMe ? 'You' : 'User')}
//                                 </p>
//                                 <p className='text-sm'>{msg.message}</p>
//                                 <p className='text-xs mt-1 opacity-75'>{formatIndoDate(msg.created_at)}</p>
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </>
//                     )}
//                   </div>
//                 </ScrollArea>
//                 <div className='pt-2 border-t border-slate-200'>
//                   <div className='flex space-x-3'>
//                     <Input
//                       value={message}
//                       onChange={(e) => setMessage(e.target.value)}
//                       onKeyPress={handleKeyPress}
//                       placeholder='Send Message'
//                       className='flex-1 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/80'
//                     />
//                     <Button
//                       onClick={handleSendMessage}
//                       disabled={!message.trim()}
//                       className='bg-blue-600 hover:bg-blue-700 text-white px-4 h-12 min-w-[50px]'
//                     >
//                     <Send className='w-4 h-4' />
//                   </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
      
// <Dialog open={isConfirmCompleteOpen} onOpenChange={setIsConfirmCompleteOpen}>
//   <DialogContent className="max-w-md mx-auto z-[999]">
//     <DialogHeader>
//       <DialogTitle className="text-lg font-semibold text-gray-900">
//         Selesaikan Transaksi
//       </DialogTitle>
//     </DialogHeader>
//     <div className="space-y-4">
//       <p className="text-gray-600">
//         Apakah Anda yakin ingin menyelesaikan transaksi ini? Aksi ini tidak dapat dibatalkan dan dana akan dilepaskan ke penjual.
//       </p>
//       <div className="flex gap-3 justify-end">
//         <Button
//           variant="outline"
//           onClick={() => setIsConfirmCompleteOpen(false)}
//           className="border-gray-300 text-gray-700"
//         >
//           Batal
//         </Button>
//         <Button
//           onClick={handleCompleteTransaction}
//           className="bg-green-600 hover:bg-green-700 text-white"
//         >
//           Ya, Selesaikan
//         </Button>
//       </div>
//     </div>
//   </DialogContent>
// </Dialog>

// {/* Dialog Success */}
// <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
//   <DialogContent className="max-w-md mx-auto z-[999]">
//     <DialogHeader>
//       <DialogTitle className="text-lg font-semibold text-green-600 flex items-center gap-2">
//         <CheckCircle className="h-5 w-5" />
//         Berhasil
//       </DialogTitle>
//     </DialogHeader>
//     <div className="space-y-4">
//       <p className="text-gray-600">{successModalMessage}</p>
//       <div className="flex justify-end">
//         <Button
//           onClick={() => {
//             setIsSuccessModalOpen(false);
//             window.location.reload();
//           }}
//           className="bg-green-600 hover:bg-green-700 text-white"
//         >
//           OK
//         </Button>
//       </div>
//     </div>
//   </DialogContent>
// </Dialog>

// {/* Dialog Error */}
// <Dialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
//   <DialogContent className="max-w-md mx-auto z-[999]">
//     <DialogHeader>
//       <DialogTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
//         <AlertCircle className="h-5 w-5" />
//         Gagal
//       </DialogTitle>
//     </DialogHeader>
//     <div className="space-y-4">
//       <p className="text-gray-600">{errorModalMessage}</p>
//       <div className="flex justify-end">
//         <Button
//           onClick={() => setIsErrorModalOpen(false)}
//           className="bg-red-600 hover:bg-red-700 text-white"
//         >
//           OK
//         </Button>
//       </div>
//     </div>
//   </DialogContent>
// </Dialog>
//     </div> 