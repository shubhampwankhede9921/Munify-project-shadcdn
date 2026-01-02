import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DollarSign, 
  Percent, 
  Calendar, 
  CheckCircle2, 
  Shield,
  FileText,
  History
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiService from '@/services/api'
import { alerts } from '@/lib/alerts'
import { useAuth } from '@/contexts/auth-context'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FeeConfiguration {
  organizationId: number
  organizationType: 'lender' | 'municipality'
  
  // Subscription Fee (Lenders)
  subscriptionFee?: {
    enabled: boolean
    amount: number
    currency: string
    subscriptionPeriodMonths: number
    isExempt: boolean
    exemptionReason?: string
  }
  
  // Listing Fee (Municipalities)
  listingFee?: {
    enabled: boolean
    percentage: number
    isExempt: boolean
    exemptionReason?: string
  }
  
  // Success Fee (Municipalities)
  successFee?: {
    enabled: boolean
    percentage: number
    adjustAgainstListingFee: boolean
    isExempt: boolean
    exemptionReason?: string
  }
  
  // General
  isFullyExempt: boolean
  exemptionReason?: string
  configuredBy?: string
  configuredAt?: string
  updatedBy?: string
  updatedAt?: string
}

interface FeeConfigurationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: number
  organizationName: string
  organizationType: 'lender' | 'municipality'
  parentBranchId?: number
}

// Helper component for exemption reason input
const ExemptionReasonInput = ({
  id,
  value,
  onChange,
  label,
  placeholder = "Enter reason for exemption",
  description
}: {
  id: string
  value: string
  onChange: (value: string) => void
  label: string
  placeholder?: string
  description: string
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
)

export function FeeConfigurationDialog({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  organizationType,
}: FeeConfigurationDialogProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('subscription')
  const [isFullyExempt, setIsFullyExempt] = useState(false)
  const [exemptionReason, setExemptionReason] = useState('')
  
  // Subscription Fee State (for Lenders)
  const [subscriptionEnabled, setSubscriptionEnabled] = useState(false)
  const [subscriptionAmount, setSubscriptionAmount] = useState('')
  const [subscriptionCurrency, setSubscriptionCurrency] = useState('INR')
  const [subscriptionPeriodMonths, setSubscriptionPeriodMonths] = useState('12')
  const [subscriptionIsExempt, setSubscriptionIsExempt] = useState(false)
  const [subscriptionExemptionReason, setSubscriptionExemptionReason] = useState('')
  
  // Listing Fee State (for Municipalities)
  const [listingEnabled, setListingEnabled] = useState(false)
  const [listingPercentage, setListingPercentage] = useState('')
  const [listingIsExempt, setListingIsExempt] = useState(false)
  const [listingExemptionReason, setListingExemptionReason] = useState('')
  
  // Success Fee State (for Municipalities)
  const [successEnabled, setSuccessEnabled] = useState(false)
  const [successPercentage, setSuccessPercentage] = useState('')
  const [successAdjustAgainstListing, setSuccessAdjustAgainstListing] = useState(true)
  const [successIsExempt, setSuccessIsExempt] = useState(false)
  const [successExemptionReason, setSuccessExemptionReason] = useState('')

  // Fetch existing fee configuration
  const { data: existingConfig, isLoading: loadingConfig } = useQuery({
    queryKey: ['feeConfiguration', organizationId],
    queryFn: async () => {
      try {
        const response = await apiService.get(`/organizations/${organizationId}/fee-configuration`)
        return response as FeeConfiguration
      } catch (error: any) {
        // If 404, return null (no config exists yet)
        if (error?.response?.status === 404) {
          return null
        }
        throw error
      }
    },
    enabled: open && !!organizationId,
  })

  // Populate form when config is loaded
  useEffect(() => {
    if (existingConfig) {
      setIsFullyExempt(existingConfig.isFullyExempt || false)
      setExemptionReason(existingConfig.exemptionReason || '')
      
      if (existingConfig.subscriptionFee) {
        setSubscriptionEnabled(existingConfig.subscriptionFee.enabled)
        setSubscriptionAmount(existingConfig.subscriptionFee.amount?.toString() || '')
        setSubscriptionCurrency(existingConfig.subscriptionFee.currency || 'INR')
        setSubscriptionPeriodMonths(existingConfig.subscriptionFee.subscriptionPeriodMonths?.toString() || '12')
        setSubscriptionIsExempt(existingConfig.subscriptionFee.isExempt || false)
        setSubscriptionExemptionReason(existingConfig.subscriptionFee.exemptionReason || '')
      }
      
      if (existingConfig.listingFee) {
        setListingEnabled(existingConfig.listingFee.enabled)
        setListingPercentage(existingConfig.listingFee.percentage?.toString() || '')
        setListingIsExempt(existingConfig.listingFee.isExempt || false)
        setListingExemptionReason(existingConfig.listingFee.exemptionReason || '')
      }
      
      if (existingConfig.successFee) {
        setSuccessEnabled(existingConfig.successFee.enabled)
        setSuccessPercentage(existingConfig.successFee.percentage?.toString() || '')
        setSuccessAdjustAgainstListing(existingConfig.successFee.adjustAgainstListingFee ?? true)
        setSuccessIsExempt(existingConfig.successFee.isExempt || false)
        setSuccessExemptionReason(existingConfig.successFee.exemptionReason || '')
      }
    } else {
      // Reset to defaults when no config exists
      resetForm()
    }
  }, [existingConfig])

  const resetForm = useCallback(() => {
    setIsFullyExempt(false)
    setExemptionReason('')
    setSubscriptionEnabled(false)
    setSubscriptionAmount('')
    setSubscriptionCurrency('INR')
    setSubscriptionPeriodMonths('12')
    setSubscriptionIsExempt(false)
    setSubscriptionExemptionReason('')
    setListingEnabled(false)
    setListingPercentage('')
    setListingIsExempt(false)
    setListingExemptionReason('')
    setSuccessEnabled(false)
    setSuccessPercentage('')
    setSuccessAdjustAgainstListing(true)
    setSuccessIsExempt(false)
    setSuccessExemptionReason('')
  }, [])

  // Validation helpers
  const validateSubscriptionFee = useCallback(() => {
    if (!subscriptionEnabled) return true
    if (subscriptionIsExempt) {
      if (!subscriptionExemptionReason.trim()) {
        alerts.error('Validation Error', 'Please provide a reason for subscription fee exemption')
        return false
      }
    } else {
      if (!subscriptionAmount || parseFloat(subscriptionAmount) <= 0) {
        alerts.error('Validation Error', 'Please enter a valid subscription amount')
        return false
      }
      const periodMonths = parseFloat(subscriptionPeriodMonths)
      if (isNaN(periodMonths) || periodMonths <= 0) {
        alerts.error('Validation Error', 'Please enter a valid subscription period in months')
        return false
      }
    }
    return true
  }, [subscriptionEnabled, subscriptionIsExempt, subscriptionExemptionReason, subscriptionAmount, subscriptionPeriodMonths])

  const validateMunicipalityFees = useCallback(() => {
    if (listingEnabled) {
      if (listingIsExempt) {
        if (!listingExemptionReason.trim()) {
          alerts.error('Validation Error', 'Please provide a reason for listing fee exemption')
          return false
        }
      } else {
        const listingPct = parseFloat(listingPercentage)
        if (isNaN(listingPct) || listingPct < 0 || listingPct > 100) {
          alerts.error('Validation Error', 'Listing fee percentage must be between 0 and 100')
          return false
        }
      }
    }

    if (successEnabled) {
      if (successIsExempt) {
        if (!successExemptionReason.trim()) {
          alerts.error('Validation Error', 'Please provide a reason for success fee exemption')
          return false
        }
      } else {
        const successPct = parseFloat(successPercentage)
        if (isNaN(successPct) || successPct < 0 || successPct > 100) {
          alerts.error('Validation Error', 'Success fee percentage must be between 0 and 100')
          return false
        }
        if (successPct < 0.5 || successPct > 1) {
          alerts.error('Validation Error', 'Success fee should typically be between 0.5% and 1%')
          return false
        }
      }
    }
    return true
  }, [listingEnabled, listingIsExempt, listingExemptionReason, listingPercentage, successEnabled, successIsExempt, successExemptionReason, successPercentage])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (config: FeeConfiguration) => {
      if (existingConfig) {
        return apiService.put(`/organizations/${organizationId}/fee-configuration`, config)
      } else {
        return apiService.post(`/organizations/${organizationId}/fee-configuration`, config)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeConfiguration', organizationId] })
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      alerts.success('Success', 'Fee configuration saved successfully')
      onOpenChange(false)
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to save fee configuration'
      alerts.error('Error', errorMessage)
    },
  })

  const handleSave = useCallback(() => {
    // Validation
    if (isFullyExempt && !exemptionReason.trim()) {
      alerts.error('Validation Error', 'Please provide a reason for exemption')
      return
    }

    if (organizationType === 'lender' && !validateSubscriptionFee()) {
      return
    }

    if (organizationType === 'municipality' && !validateMunicipalityFees()) {
      return
    }

    const config: FeeConfiguration = {
      organizationId,
      organizationType,
      isFullyExempt,
      exemptionReason: isFullyExempt ? exemptionReason : undefined,
      configuredBy: user?.data?.login,
      updatedBy: user?.data?.login,
    }

    if (organizationType === 'lender') {
      config.subscriptionFee = {
        enabled: subscriptionEnabled,
        amount: subscriptionEnabled && !subscriptionIsExempt ? parseFloat(subscriptionAmount) : 0,
        currency: subscriptionCurrency,
        subscriptionPeriodMonths: subscriptionEnabled && !subscriptionIsExempt ? parseInt(subscriptionPeriodMonths) : 12,
        isExempt: subscriptionIsExempt,
        exemptionReason: subscriptionIsExempt ? subscriptionExemptionReason : undefined,
      }
    }

    if (organizationType === 'municipality') {
      config.listingFee = {
        enabled: listingEnabled,
        percentage: listingEnabled && !listingIsExempt ? parseFloat(listingPercentage) : 0,
        isExempt: listingIsExempt,
        exemptionReason: listingIsExempt ? listingExemptionReason : undefined,
      }

      config.successFee = {
        enabled: successEnabled,
        percentage: successEnabled && !successIsExempt ? parseFloat(successPercentage) : 0,
        adjustAgainstListingFee: successAdjustAgainstListing,
        isExempt: successIsExempt,
        exemptionReason: successIsExempt ? successExemptionReason : undefined,
      }
    }

    saveMutation.mutate(config)
  }, [
    isFullyExempt,
    exemptionReason,
    organizationType,
    validateSubscriptionFee,
    validateMunicipalityFees,
    user?.data?.login,
    subscriptionEnabled,
    subscriptionIsExempt,
    subscriptionAmount,
    subscriptionCurrency,
    subscriptionPeriodMonths,
    subscriptionExemptionReason,
    listingEnabled,
    listingIsExempt,
    listingPercentage,
    listingExemptionReason,
    successEnabled,
    successIsExempt,
    successPercentage,
    successAdjustAgainstListing,
    successExemptionReason,
    existingConfig,
    organizationId,
    saveMutation
  ])

  // Set default tab based on organization type
  useEffect(() => {
    if (open) {
      setActiveTab(organizationType === 'lender' ? 'subscription' : 'listing')
    }
  }, [open, organizationType])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Fee Configuration
          </DialogTitle>
          <DialogDescription className="text-base">
            Configure fees for <span className="font-semibold">{organizationName}</span>
            <Badge variant="outline" className="ml-2 capitalize">{organizationType}</Badge>
          </DialogDescription>
        </DialogHeader>

        {loadingConfig ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading fee configuration...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Full Exemption Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Exemption Status
                </CardTitle>
                <CardDescription>
                  Mark organization as fully exempt from all fees (for Munify Admins, Govt/NIUA invited bodies)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="fullyExempt" className="text-base font-medium">
                      Fully Exempt from All Fees
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, this organization bypasses all payment flows
                    </p>
                  </div>
                  <Switch
                    id="fullyExempt"
                    checked={isFullyExempt}
                    onCheckedChange={setIsFullyExempt}
                  />
                </div>
                {isFullyExempt && (
                  <div className="space-y-2">
                    <Label htmlFor="exemptionReason">Exemption Reason *</Label>
                    <Input
                      id="exemptionReason"
                      value={exemptionReason}
                      onChange={(e) => setExemptionReason(e.target.value)}
                      placeholder="e.g., Munify Admin, Govt/NIUA invited body"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {!isFullyExempt && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {organizationType === 'lender' && (
                    <TabsTrigger value="subscription" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Subscription Fee
                    </TabsTrigger>
                  )}
                  {organizationType === 'municipality' && (
                    <>
                      <TabsTrigger value="listing" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Listing Fee
                      </TabsTrigger>
                      <TabsTrigger value="success" className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Success Fee
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>

                {/* Subscription Fee Tab (Lenders) */}
                {organizationType === 'lender' && (
                  <TabsContent value="subscription" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Subscription Fee Configuration</CardTitle>
                        <CardDescription>
                          Annual or monthly subscription fee for platform access. May not be charged in Phase 1, but system supports configuration.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="subscriptionEnabled">Enable Subscription Fee</Label>
                            <p className="text-sm text-muted-foreground">
                              Enable subscription fee for this lender
                            </p>
                          </div>
                          <Switch
                            id="subscriptionEnabled"
                            checked={subscriptionEnabled}
                            onCheckedChange={setSubscriptionEnabled}
                          />
                        </div>

                        {subscriptionEnabled && (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="subscriptionExempt">Exempt from Subscription Fee</Label>
                                <p className="text-sm text-muted-foreground">
                                  Mark this lender as exempt from subscription fees
                                </p>
                              </div>
                              <Switch
                                id="subscriptionExempt"
                                checked={subscriptionIsExempt}
                                onCheckedChange={(checked) => {
                                  setSubscriptionIsExempt(checked)
                                  if (!checked) {
                                    setSubscriptionExemptionReason('')
                                  }
                                }}
                              />
                            </div>

                            {subscriptionIsExempt && (
                              <ExemptionReasonInput
                                id="subscriptionExemptionReason"
                                value={subscriptionExemptionReason}
                                onChange={setSubscriptionExemptionReason}
                                label="Exemption Reason *"
                                description="Please provide a reason for exempting this lender from subscription fees"
                              />
                            )}

                            {!subscriptionIsExempt && (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="subscriptionAmount">Amount *</Label>
                                    <Input
                                      id="subscriptionAmount"
                                      type="number"
                                      value={subscriptionAmount}
                                      onChange={(e) => setSubscriptionAmount(e.target.value)}
                                      placeholder="0.00"
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="subscriptionCurrency">Currency</Label>
                                    <Select value={subscriptionCurrency} onValueChange={setSubscriptionCurrency}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="INR">INR (₹)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="subscriptionPeriodMonths">Subscription Period (Months) *</Label>
                                  <Input
                                    id="subscriptionPeriodMonths"
                                    type="number"
                                    value={subscriptionPeriodMonths}
                                    onChange={(e) => setSubscriptionPeriodMonths(e.target.value)}
                                    placeholder="12"
                                    min="1"
                                    step="1"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Duration of the subscription period in months (default: 12 months)
                                  </p>
                                </div>

                                {subscriptionAmount && parseFloat(subscriptionAmount) > 0 && subscriptionPeriodMonths && (
                                  <Alert>
                                    <DollarSign className="h-4 w-4" />
                                    <AlertDescription>
                                      Subscription fee: <strong>{formatCurrency(parseFloat(subscriptionAmount))}</strong> for {subscriptionPeriodMonths} {parseInt(subscriptionPeriodMonths) === 1 ? 'month' : 'months'}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* Listing Fee Tab (Municipalities) */}
                {organizationType === 'municipality' && (
                  <TabsContent value="listing" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Listing Fee Configuration</CardTitle>
                        <CardDescription>
                          Fee charged when municipality posts a project. Calculated as percentage of project fund requirement. Can be set to 0% for promotional categories or exemptions.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="listingEnabled">Enable Listing Fee</Label>
                            <p className="text-sm text-muted-foreground">
                              Enable listing fee for this municipality
                            </p>
                          </div>
                          <Switch
                            id="listingEnabled"
                            checked={listingEnabled}
                            onCheckedChange={setListingEnabled}
                          />
                        </div>

                        {listingEnabled && (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="listingExempt">Exempt from Listing Fee</Label>
                                <p className="text-sm text-muted-foreground">
                                  Mark this municipality as exempt from listing fees
                                </p>
                              </div>
                              <Switch
                                id="listingExempt"
                                checked={listingIsExempt}
                                onCheckedChange={(checked) => {
                                  setListingIsExempt(checked)
                                  if (!checked) {
                                    setListingExemptionReason('')
                                  }
                                }}
                              />
                            </div>

                            {listingIsExempt && (
                              <ExemptionReasonInput
                                id="listingExemptionReason"
                                value={listingExemptionReason}
                                onChange={setListingExemptionReason}
                                label="Exemption Reason *"
                                description="Please provide a reason for exempting this municipality from listing fees"
                              />
                            )}

                            {!listingIsExempt && (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="listingPercentage">Listing Fee Percentage *</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      id="listingPercentage"
                                      type="number"
                                      value={listingPercentage}
                                      onChange={(e) => setListingPercentage(e.target.value)}
                                      placeholder="0.00"
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      className="flex-1"
                                    />
                                    <span className="text-muted-foreground">%</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Percentage of project fund requirement. Can be set to 0% for promotional categories.
                                  </p>
                                </div>

                                {listingPercentage && parseFloat(listingPercentage) > 0 && (
                                  <Alert>
                                    <Percent className="h-4 w-4" />
                                    <AlertDescription>
                                      Listing fee: <strong>{listingPercentage}%</strong> of project fund requirement
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* Success Fee Tab (Municipalities) */}
                {organizationType === 'municipality' && (
                  <TabsContent value="success" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Success Fee Configuration</CardTitle>
                        <CardDescription>
                          Fee charged when project is successfully funded/closed. Typically 0.5-1% of funded amount. Can be adjusted against listing fee already paid.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="successEnabled">Enable Success Fee</Label>
                            <p className="text-sm text-muted-foreground">
                              Enable success fee for this municipality
                            </p>
                          </div>
                          <Switch
                            id="successEnabled"
                            checked={successEnabled}
                            onCheckedChange={setSuccessEnabled}
                          />
                        </div>

                        {successEnabled && (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="successExempt">Exempt from Success Fee</Label>
                                <p className="text-sm text-muted-foreground">
                                  Mark this municipality as exempt from success fees
                                </p>
                              </div>
                              <Switch
                                id="successExempt"
                                checked={successIsExempt}
                                onCheckedChange={(checked) => {
                                  setSuccessIsExempt(checked)
                                  if (!checked) {
                                    setSuccessExemptionReason('')
                                  }
                                }}
                              />
                            </div>

                            {successIsExempt && (
                              <ExemptionReasonInput
                                id="successExemptionReason"
                                value={successExemptionReason}
                                onChange={setSuccessExemptionReason}
                                label="Exemption Reason *"
                                description="Please provide a reason for exempting this municipality from success fees"
                              />
                            )}

                            {!successIsExempt && (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="successPercentage">Success Fee Percentage *</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      id="successPercentage"
                                      type="number"
                                      value={successPercentage}
                                      onChange={(e) => setSuccessPercentage(e.target.value)}
                                      placeholder="0.50"
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      className="flex-1"
                                    />
                                    <span className="text-muted-foreground">%</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Typically between 0.5% and 1% of funded amount
                                  </p>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <Label htmlFor="successAdjust">Adjust Against Listing Fee</Label>
                                    <p className="text-sm text-muted-foreground">
                                      Net amount = Success Fee - Listing Fee (if already paid)
                                    </p>
                                  </div>
                                  <Switch
                                    id="successAdjust"
                                    checked={successAdjustAgainstListing}
                                    onCheckedChange={setSuccessAdjustAgainstListing}
                                  />
                                </div>

                                {successPercentage && parseFloat(successPercentage) > 0 && (
                                  <Alert>
                                    <Percent className="h-4 w-4" />
                                    <AlertDescription>
                                      Success fee: <strong>{successPercentage}%</strong> of funded amount
                                      {successAdjustAgainstListing && (
                                        <span className="block mt-1 text-xs">
                                          Will be adjusted against listing fee if already paid
                                        </span>
                                      )}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            )}

            {/* Configuration Info */}
            {existingConfig && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Configuration History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {existingConfig.configuredBy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Configured By:</span>
                      <span className="font-medium">{existingConfig.configuredBy}</span>
                    </div>
                  )}
                  {existingConfig.configuredAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Configured At:</span>
                      <span className="font-medium">
                        {new Date(existingConfig.configuredAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {existingConfig.updatedBy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated By:</span>
                      <span className="font-medium">{existingConfig.updatedBy}</span>
                    </div>
                  )}
                  {existingConfig.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated At:</span>
                      <span className="font-medium">
                        {new Date(existingConfig.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saveMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

